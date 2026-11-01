import { onCall, HttpsError } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "../shared/config.js";
import { createHash } from "node:crypto";
import { validateRequiredFields, handleError } from "../auth/utils.js";
import { constants } from "../shared/constants.js";

const { COOLDOWN_MS, BATCH_SIZE, VIEW_BUFFER_COLLECTION, RECENT_VIEWS_COLLECTION } = constants;

// Views count once per viewer per hour. The viewer is the signed-in account
// or, for visitors, a hash of the IP address and the day; never an ID the
// browser picks, so a script can't inflate counts by inventing viewers.
const viewerKeyOf = (request) => {
    if (request.auth?.uid) return `u_${request.auth.uid}`;
    const ip = request.rawRequest?.ip ?? "unknown";
    const day = new Date().toISOString().slice(0, 10);
    return `ip_${createHash("sha256").update(`${ip}|${day}`).digest("hex").slice(0, 24)}`;
};

export const trackModelView = onCall(async (request) => {
    try {
        const { modelId } = request.data ?? {};
        if (typeof modelId !== "string" || !modelId || modelId.includes("/")) {
            throw new HttpsError("invalid-argument", "Model ID is required.");
        }

        const viewerKey = viewerKeyOf(request);
        const modelRef = db.collection("models").doc(modelId);
        const recentRef = db.collection(RECENT_VIEWS_COLLECTION).doc(`${modelId}_${viewerKey}`);

        const counted = await db.runTransaction(async (transaction) => {
            const [modelDoc, recentDoc] = await Promise.all([
                transaction.get(modelRef),
                transaction.get(recentRef),
            ]);
            if (!modelDoc.exists) {
                throw new HttpsError("not-found", "Model not found.");
            }
            const lastViewAt = recentDoc.exists ? recentDoc.get("at")?.toMillis() : 0;
            if (lastViewAt && Date.now() - lastViewAt < COOLDOWN_MS) {
                return false;
            }

            transaction.update(modelRef, {
                views: FieldValue.increment(1),
                lastViewedAt: FieldValue.serverTimestamp(),
            });
            transaction.set(recentRef, { at: FieldValue.serverTimestamp() });

            // Log to buffer for analytics
            transaction.set(db.collection(VIEW_BUFFER_COLLECTION).doc(), {
                modelId,
                viewerId: viewerKey,
                timestamp: FieldValue.serverTimestamp(),
                processed: false,
            });
            return true;
        });

        return counted
            ? { success: true, message: "View tracked" }
            : { success: false, reason: "cooldown" };
    } catch (error) {
        handleError(error, "trackModelView");
    }
});

// Analytics processor - runs every 5 minutes for user engagement analytics
export const processViewAnalytics = onSchedule("*/5 * * * *", async () => {
    try {
        console.log(
            "Starting view analytics processing (analytics only, no view count changes)..."
        );

        // Get unprocessed view events from buffer
        const pendingViews = await db
            .collection(VIEW_BUFFER_COLLECTION)
            .where("processed", "==", false)
            .limit(BATCH_SIZE)
            .get();

        if (pendingViews.empty) {
            console.log("No pending view events for analytics processing");
            return null;
        }

        const batch = db.batch();
        const viewerEngagement = new Map();

        // Process events for user engagement analytics
        pendingViews.docs.forEach((doc) => {
            const data = doc.data();
            const { modelId, viewerId, timestamp } = data;

            // Aggregate viewer engagement data for analytics
            const engagementKey = `${modelId}_${viewerId}`;
            if (!viewerEngagement.has(engagementKey)) {
                viewerEngagement.set(engagementKey, {
                    modelId,
                    viewerId,
                    sessionViews: 0,
                    lastViewAt: timestamp,
                });
            }
            viewerEngagement.get(engagementKey).sessionViews++;

            batch.update(doc.ref, { processed: true });
        });

        // Update viewer engagement analytics
        for (const [key, engagement] of viewerEngagement.entries()) {
            const analyticsRef = db.collection("viewerActivity").doc(key);
            batch.set(
                analyticsRef,
                {
                    modelId: engagement.modelId,
                    viewerId: engagement.viewerId,
                    totalEngagements: FieldValue.increment(engagement.sessionViews),
                    lastEngagementAt: engagement.lastViewAt,
                    updatedAt: FieldValue.serverTimestamp(),
                },
                { merge: true }
            );
        }

        await batch.commit();

        console.log(`✅ Processed ${pendingViews.size} view events for analytics`);
        return null;
    } catch (error) {
        console.error("Error processing view analytics:", error);
        return null;
    }
});

// Get view count (for analytics)
export const getModelViewCount = onCall(async (request) => {
    try {
        const { modelId } = request.data;

        validateRequiredFields(request.data, ["modelId"]);

        const modelDoc = await db.collection("models").doc(modelId).get();

        if (!modelDoc.exists) {
            throw new HttpsError("not-found", "Model not found");
        }

        return { viewCount: modelDoc.data().views || 0 };
    } catch (error) {
        handleError(error, "getModelViewCount");
    }
});

// Cleanup old processed views buffer
export const cleanupViewBuffer = onSchedule("0 2 * * *", async () => {
    try {
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);

        const oldViews = await db
            .collection(VIEW_BUFFER_COLLECTION)
            .where("processed", "==", true)
            .where("timestamp", "<", oneDayAgo)
            .limit(500)
            .get();

        const oldRecentViews = await db
            .collection(RECENT_VIEWS_COLLECTION)
            .where("at", "<", oneDayAgo)
            .limit(500)
            .get();

        const stale = [...oldViews.docs, ...oldRecentViews.docs];
        if (stale.length === 0) {
            console.log("No old view entries to clean up");
            return null;
        }

        const batch = db.batch();
        stale.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();

        console.log(`Cleaned up ${stale.length} old view entries`);
        return null;
    } catch (error) {
        console.error("Error cleaning up view buffer:", error);
        return null;
    }
});
