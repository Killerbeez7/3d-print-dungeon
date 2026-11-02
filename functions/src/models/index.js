import admin from "firebase-admin";
import { onDocumentCreated, onDocumentDeleted } from "firebase-functions/v2/firestore";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { requireAuth } from "../auth/utils.js";
import { originalPathOf, pathFromDownloadUrl } from "../shared/storagePaths.js";

const DOWNLOAD_LINK_MINUTES = 5;

// When a like is created, increment model.likes, uploader public stats.likesCount, and create notification
export const onLikeCreated = onDocumentCreated("likes/{likeId}", async (event) => {
    const snap = event.data;
    if (!snap) return;
    const { modelId, userId } = snap.data() || {};
    if (!modelId || !userId) return;

    const db = admin.firestore();
    const modelRef = db.doc(`models/${modelId}`);

    await db.runTransaction(async (tx) => {
        const modelSnap = await tx.get(modelRef);
        if (!modelSnap.exists) return;
        tx.update(modelRef, { likes: admin.firestore.FieldValue.increment(1) });

        const model = modelSnap.data() || {};
        const uploaderId = model.uploaderId;
        if (uploaderId) {
            const uploaderPublicRef = db.doc(`users/${uploaderId}/public/data`);
            tx.set(
                uploaderPublicRef,
                { stats: { likesCount: admin.firestore.FieldValue.increment(1) } },
                { merge: true }
            );
        }
    });

    // Create notification after the transaction (to avoid transaction conflicts)
    try {
        // Get model information
        const modelSnap = await modelRef.get();
        if (!modelSnap.exists) return;

        const model = modelSnap.data();
        const uploaderId = model.uploaderId;

        if (!uploaderId) return;

        // Don't create notification if user likes their own model
        if (uploaderId === userId) return;

        // Get liker's information
        const likerRef = db.doc(`users/${userId}/public/data`);
        const likerSnap = await likerRef.get();
        const likerData = likerSnap.exists ? likerSnap.data() : {};
        const likerDisplayName = likerData.displayName || "Anonymous";

        // Get model name
        const modelName = model.name || "Unknown Model";

        // Create notification
        await db.collection("userNotifications").add({
            userId: uploaderId,
            type: "like",
            title: "New Like!",
            message: `${likerDisplayName} liked your model "${modelName}"`,
            relatedId: modelId,
            relatedType: "model",
            metadata: {
                likerId: userId,
                likerName: likerDisplayName,
                modelName: modelName,
                likerAvatar: likerData.photoURL || null,
            },
            status: "unread",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        console.log(
            `✅ Like notification created for model "${modelName}" by ${likerDisplayName}`
        );
    } catch (error) {
        console.error("Failed to create like notification:", error);
        // Don't throw error - notification failure shouldn't break the like functionality
    }
});

// When a like is deleted, decrement model.likes and uploader public stats.likesCount
export const onLikeDeleted = onDocumentDeleted("likes/{likeId}", async (event) => {
    const snap = event.data;
    if (!snap) return;
    const { modelId } = snap.data() || {};
    if (!modelId) return;

    const db = admin.firestore();
    const modelRef = db.doc(`models/${modelId}`);

    await db.runTransaction(async (tx) => {
        const modelSnap = await tx.get(modelRef);
        if (!modelSnap.exists) return;
        tx.update(modelRef, { likes: admin.firestore.FieldValue.increment(-1) });

        const model = modelSnap.data() || {};
        const uploaderId = model.uploaderId;
        if (uploaderId) {
            const uploaderPublicRef = db.doc(`users/${uploaderId}/public/data`);
            tx.set(
                uploaderPublicRef,
                { stats: { likesCount: admin.firestore.FieldValue.increment(-1) } },
                { merge: true }
            );
        }
    });
});

// Delete model and all related data
export const deleteModel = onCall({ maxInstances: 10 }, async (request) => {
    const { uid, token } = requireAuth(request);
    const { modelId } = request.data ?? {};

    if (typeof modelId !== "string" || !modelId) {
        throw new HttpsError("invalid-argument", "Model ID is required.");
    }

    const db = admin.firestore();
    const storage = admin.storage();

    try {
        // Get the model to check permissions and file paths
        const modelRef = db.doc(`models/${modelId}`);
        const modelSnap = await modelRef.get();

        if (!modelSnap.exists) {
            throw new HttpsError("not-found", "Model not found.");
        }

        const model = modelSnap.data();

        // Owners and admins (custom claims, never a field users can write).
        const isAdmin = token.admin === true || token.super === true;
        if (model.uploaderId !== uid && !isAdmin) {
            throw new HttpsError("permission-denied", "You can't delete this model.");
        }

        // Delete in a transaction to ensure consistency
        await db.runTransaction(async (transaction) => {
            // Delete comments
            const commentsQuery = db
                .collection("comments")
                .where("modelId", "==", modelId);
            const commentsSnap = await transaction.get(commentsQuery);
            commentsSnap.docs.forEach((doc) => {
                transaction.delete(doc.ref);
            });

            // Delete likes
            const likesQuery = db.collection("likes").where("modelId", "==", modelId);
            const likesSnap = await transaction.get(likesQuery);
            likesSnap.docs.forEach((doc) => {
                transaction.delete(doc.ref);
            });

            // Delete views
            const viewTrackersQuery = db
                .collection("viewTrackers")
                .where("modelId", "==", modelId);
            const viewTrackersSnap = await transaction.get(viewTrackersQuery);
            viewTrackersSnap.docs.forEach((doc) => {
                transaction.delete(doc.ref);
            });

            const userViewsQuery = db
                .collection("userViews")
                .where("modelId", "==", modelId);
            const userViewsSnap = await transaction.get(userViewsQuery);
            userViewsSnap.docs.forEach((doc) => {
                transaction.delete(doc.ref);
            });

            // Remove from the uploader's list (only users who have it, not
            // every user document).
            const uploadersQuery = db
                .collection("users")
                .where("uploads", "array-contains", modelId);
            const uploadersSnap = await transaction.get(uploadersQuery);
            uploadersSnap.docs.forEach((userDoc) => {
                transaction.update(userDoc.ref, {
                    uploads: admin.firestore.FieldValue.arrayRemove(modelId),
                });
            });

            // Delete the model document
            transaction.delete(modelRef);
        });

        // Delete files from storage (outside the transaction). Media shared with
        // another listing stays.
        const mediaUrls = [
            model.convertedFileUrl,
            model.renderPrimaryUrl,
            model.posterUrl,
            ...(Array.isArray(model.renderExtraUrls) ? model.renderExtraUrls : []),
        ].filter((url) => typeof url === "string" && url);

        const sharedUrls = new Set();
        for (const url of mediaUrls) {
            const [converted, primary, poster, extra] = await Promise.all([
                db.collection("models").where("convertedFileUrl", "==", url).limit(1).get(),
                db.collection("models").where("renderPrimaryUrl", "==", url).limit(1).get(),
                db.collection("models").where("posterUrl", "==", url).limit(1).get(),
                db.collection("models").where("renderExtraUrls", "array-contains", url).limit(1).get(),
            ]);
            if (!converted.empty || !primary.empty || !poster.empty || !extra.empty) {
                sharedUrls.add(url);
            }
        }

        // The original stays too if another listing uses the same file.
        const originalField = model.originalFilePath ? "originalFilePath" : "originalFileUrl";
        const originalShared =
            typeof model[originalField] === "string" &&
            model[originalField] &&
            !(await db.collection("models").where(originalField, "==", model[originalField]).limit(1).get()).empty;

        const storagePaths = [
            originalShared ? null : originalPathOf(model),
            ...mediaUrls.filter((url) => !sharedUrls.has(url)).map(pathFromDownloadUrl),
        ].filter(Boolean);

        const bucket = storage.bucket();
        for (const path of new Set(storagePaths)) {
            try {
                await bucket.file(path).delete();
            } catch {
                console.log(`File ${path} not found, skipping deletion`);
            }
        }

        return { success: true, message: "Model deleted successfully" };
    } catch (error) {
        if (error instanceof HttpsError) throw error;
        console.error("Error deleting model:", error.code ?? error.message);
        throw new HttpsError("internal", "Could not delete the model.");
    }
});

// Short-lived download link for a model's original file. Free models: any
// signed-in user. Paid models: the uploader, admins and buyers.
export const getModelDownloadUrl = onCall(async (request) => {
    const { uid, token } = requireAuth(request);
    const { modelId } = request.data ?? {};
    if (typeof modelId !== "string" || !modelId) {
        throw new HttpsError("invalid-argument", "Model ID is required.");
    }

    const db = admin.firestore();
    const modelSnap = await db.doc(`models/${modelId}`).get();
    if (!modelSnap.exists) {
        throw new HttpsError("not-found", "Model not found.");
    }
    const model = modelSnap.data();

    const isOwner = model.uploaderId === uid;
    const isAdmin = token.admin === true || token.super === true;
    const isFree = !model.isPaid || !(Number(model.price) > 0);
    let reason = isOwner ? "owner" : isAdmin ? "admin" : isFree ? "free" : null;
    if (!reason) {
        const purchase = await db.doc(`users/${uid}/purchases/${modelId}`).get();
        if (purchase.exists) reason = "purchase";
    }
    if (!reason) {
        throw new HttpsError("permission-denied", "Buy this model to download it.");
    }

    const path = originalPathOf(model);
    if (!path) {
        throw new HttpsError("not-found", "This model has no file to download.");
    }

    const fileName = (model.originalFileName || path.split("/").pop()).replace(
        /[^\w.\- ]+/g,
        "_"
    );

    let url;
    try {
        [url] = await admin
            .storage()
            .bucket()
            .file(path)
            .getSignedUrl({
                version: "v4",
                action: "read",
                expires: Date.now() + DOWNLOAD_LINK_MINUTES * 60 * 1000,
                responseDisposition: `attachment; filename="${fileName}"`,
            });
    } catch (error) {
        console.error("getModelDownloadUrl: signing failed", error.code ?? error.message);
        throw new HttpsError("unavailable", "Downloads are temporarily unavailable.");
    }

    await db.collection("downloads").add({
        modelId,
        userId: uid,
        reason,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { url, fileName };
});
