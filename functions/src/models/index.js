import admin from "firebase-admin";
import { onDocumentCreated, onDocumentDeleted } from "firebase-functions/v2/firestore";
import { onCall } from "firebase-functions/v2/https";

// When a like is created, increment model.likes and uploader public stats.likesCount
export const onLikeCreated = onDocumentCreated("likes/{likeId}", async (event) => {
    const snap = event.data;
    if (!snap) return;
    const { modelId } = snap.data() || {};
    if (!modelId) return;

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
    const { modelId } = request.data;
    const { uid } = request.auth;

    if (!uid) {
        throw new Error("Unauthorized");
    }

    if (!modelId) {
        throw new Error("Model ID is required");
    }

    const db = admin.firestore();
    const storage = admin.storage();

    try {
        // Get the model to check permissions and file paths
        const modelRef = db.doc(`models/${modelId}`);
        const modelSnap = await modelRef.get();

        if (!modelSnap.exists) {
            throw new Error("Model not found");
        }

        const model = modelSnap.data();

        // Check if user is authorized to delete this model
        if (model.uploaderId !== uid) {
            // Check if user is admin
            const userRef = db.doc(`users/${uid}`);
            const userSnap = await userRef.get();
            const userData = userSnap.data();

            if (!userData?.roles?.includes("admin")) {
                throw new Error("Unauthorized to delete this model");
            }
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

            // Remove from all users' favorites and uploads
            const usersQuery = db.collection("users");
            const usersSnap = await transaction.get(usersQuery);
            usersSnap.docs.forEach((userDoc) => {
                const userData = userDoc.data();
                const updates = {};

                if (userData.favorites && userData.favorites.includes(modelId)) {
                    updates.favorites = admin.firestore.FieldValue.arrayRemove(modelId);
                }

                if (userData.uploads && userData.uploads.includes(modelId)) {
                    updates.uploads = admin.firestore.FieldValue.arrayRemove(modelId);
                }

                if (Object.keys(updates).length > 0) {
                    transaction.update(userDoc.ref, updates);
                }
            });

            // Delete the model document
            transaction.delete(modelRef);
        });

        // Delete files from storage (outside transaction for better performance)
        const fileNames = [];
        if (model.originalFileUrl)
            fileNames.push(model.originalFileUrl.split("/").pop()?.split("?")[0]);
        if (model.convertedFileUrl)
            fileNames.push(model.convertedFileUrl.split("/").pop()?.split("?")[0]);
        if (model.renderPrimaryUrl)
            fileNames.push(model.renderPrimaryUrl.split("/").pop()?.split("?")[0]);
        if (model.posterUrl)
            fileNames.push(model.posterUrl.split("/").pop()?.split("?")[0]);

        if (model.renderExtraUrls && Array.isArray(model.renderExtraUrls)) {
            model.renderExtraUrls.forEach((url) => {
                fileNames.push(url.split("/").pop()?.split("?")[0]);
            });
        }

        const storagePaths = [
            `original/${fileNames[0]}`,
            `converted/${fileNames[1]}`,
            `render-primary/${fileNames[2]}`,
            `posters/${fileNames[3]}`,
        ];

        if (model.renderExtraUrls && Array.isArray(model.renderExtraUrls)) {
            model.renderExtraUrls.forEach((url, i) => {
                storagePaths.push(`render-extras/${fileNames[4 + i]}`);
            });
        }

        // Delete files from storage
        const bucket = storage.bucket();
        for (const path of storagePaths) {
            if (path && typeof path === "string") {
                try {
                    await bucket.file(path).delete();
                } catch (error) {
                    // Ignore if file doesn't exist
                    console.log(`File ${path} not found, skipping deletion`);
                }
            }
        }

        return { success: true, message: "Model deleted successfully" };
    } catch (error) {
        console.error("Error deleting model:", error);
        throw new Error(`Failed to delete model: ${error.message}`);
    }
});
