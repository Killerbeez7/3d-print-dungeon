import admin from "firebase-admin";
import { initializeApp } from "firebase-admin/app";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { onDocumentCreated, onDocumentDeleted } from "firebase-functions/v2/firestore";

const app = initializeApp();
const db = getFirestore(app);

// Track views using Firestore triggers
export const trackView = onDocumentCreated("viewTrackers/{viewId}", async (event) => {
    const viewId = event.params.viewId;
    console.log("Processing view for document:", viewId);

    // Extract modelId and userId from the viewId (format: modelId_userId_timestamp)
    const parts = viewId.split("_");
    if (parts.length < 2) {
        console.error("Invalid viewId format:", viewId);
        return null;
    }

    const modelId = parts[0];
    const userId = parts[1];
    const viewData = event.data.data();

    try {
        console.log(`Updating view count for model: ${modelId}, user: ${userId}`);

        // Get the model document
        const modelRef = db.collection("models").doc(modelId);
        const modelDoc = await modelRef.get();

        if (!modelDoc.exists) {
            console.error(`Model ${modelId} not found`);
            return null;
        }

        // Update view count
        await modelRef.update({
            views: FieldValue.increment(1),
            lastViewedAt: FieldValue.serverTimestamp(),
        });

        console.log(`Successfully updated view count for model: ${modelId}`);

        // If user is logged in, track their view with display name
        if (userId && userId !== "anonymous" && viewData.userDisplayName) {
            const userViewRef = db.collection("userViews").doc(`${modelId}_${userId}`);
            await userViewRef.set(
                {
                    modelId,
                    userId,
                    userDisplayName: viewData.userDisplayName,
                    viewedAt: FieldValue.serverTimestamp(),
                },
                { merge: true }
            );
            console.log(`Tracked view for user: ${viewData.userDisplayName} (${userId})`);
        }

        return null;
    } catch (error) {
        console.error("Error tracking view:", error, error.stack);
        return null;
    }
});

// Clean up views when a model is deleted
export const cleanupModelViews = onDocumentDeleted("models/{modelId}", async (event) => {
    const modelId = event.params.modelId;
    console.log(`Cleaning up views for deleted model: ${modelId}`);

    try {
        // Delete all view trackers for this model
        const viewTrackersRef = db.collection("viewTrackers");
        const viewTrackersQuery = await viewTrackersRef
            .where("modelId", "==", modelId)
            .get();

        const batch = db.batch();
        viewTrackersQuery.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });

        // Delete all user views for this model
        const userViewsRef = db.collection("userViews");
        const userViewsQuery = await userViewsRef.where("modelId", "==", modelId).get();

        userViewsQuery.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });

        await batch.commit();
        console.log(
            `Successfully cleaned up ${viewTrackersQuery.size} view trackers and ${userViewsQuery.size} user views for model ${modelId}`
        );
        return null;
    } catch (error) {
        console.error("Error cleaning up model views:", error);
        return null;
    }
});

// Clean up old view trackers periodically
export const cleanupViewTrackers = onSchedule("0 0 * * *", async () => {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    try {
        const oldTrackers = await db
            .collection("viewTrackers")
            .where("timestamp", "<", oneDayAgo)
            .get();

        const batch = db.batch();
        oldTrackers.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });

        await batch.commit();
        console.log(`Cleaned up ${oldTrackers.size} old view trackers`);
        return null;
    } catch (error) {
        console.error("Error cleaning up view trackers:", error);
        return null;
    }
});

export const setUserRole = onCall(async (request) => {
    try {
        const { data, auth } = request;
        console.log("setUserRole called, auth:", auth);

        // is authenticated?
        if (!auth) {
            throw new HttpsError(
                "unauthenticated",
                "You must be logged in to perform this action."
            );
        }

        // is admin?
        if (auth.token.admin !== true) {
            throw new HttpsError(
                "permission-denied",
                "Only admins can change user roles."
            );
        }

        // validate input
        const { uid, role, enable } = data || {};
        if (
            typeof uid !== "string" ||
            typeof role !== "string" ||
            typeof enable !== "boolean"
        ) {
            throw new HttpsError(
                "invalid-argument",
                "data must be { uid, role: string, enable: boolean }"
            );
        }

        // get current claims
        const user = await admin.auth().getUser(uid);
        const claims = { ...user.customClaims };

        if (enable) {
            claims[role] = true;
        } else {
            delete claims[role];
        }

        await admin.auth().setCustomUserClaims(uid, claims);

        // mirror roles to firestore (for display/search)
        const enabledRoles = Object.keys(claims).filter((k) => claims[k] === true);
        const ref = admin.firestore().doc(`users/${uid}`);
        await ref.set(
            {
                roles: enabledRoles,
            },
            { merge: true }
        );

        return { status: "ok" };
    } catch (err) {
        console.error("setUserRole INTERNAL ERROR:", err);
        throw new HttpsError("internal", err.message || "Unknown error");
    }
});

export const debugAuth = onCall((request) => {
    const { auth } = request;
    console.log("debugAuth called, auth:", JSON.stringify(auth));
    return { auth: auth };
});
