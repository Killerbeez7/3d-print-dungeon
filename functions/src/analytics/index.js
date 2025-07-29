import { onCall, HttpsError } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "../shared/config.js";
import {
    validateRequiredFields,
    handleError,
    COOLDOWN_MS,
    BATCH_SIZE,
    VIEW_BUFFER_COLLECTION,
    CACHE_TTL,
} from "../shared/utils.js";

// Cache for recent views
const recentViewsCache = new Map();

// Clean cache periodically
setInterval(() => {
    const now = Date.now();
    for (const [key, timestamp] of recentViewsCache.entries()) {
        if (now - timestamp > CACHE_TTL) {
            recentViewsCache.delete(key);
        }
    }
}, CACHE_TTL);

// Hybrid view tracking - immediate update + buffer for analytics
export const trackModelView = onCall(async (request) => {
    try {
        const { modelId, viewerId } = request.data;

        validateRequiredFields(request.data, ["modelId", "viewerId"]);

        const viewKey = `${modelId}_${viewerId}`;
        const now = Date.now();

        // Check cache first
        const lastView = recentViewsCache.get(viewKey);
        if (lastView && now - lastView < COOLDOWN_MS) {
            return { success: false, reason: "cooldown" };
        }

        // Use transaction for immediate update
        await db.runTransaction(async (transaction) => {
            const modelRef = db.collection("models").doc(modelId);
            transaction.update(modelRef, {
                views: FieldValue.increment(1),
                lastViewedAt: FieldValue.serverTimestamp(),
            });

            // Log to buffer for analytics/deduplication
            const viewBufferRef = db.collection(VIEW_BUFFER_COLLECTION).doc();
            transaction.set(viewBufferRef, {
                modelId,
                viewerId,
                timestamp: FieldValue.serverTimestamp(),
                processed: false,
            });
        });

        recentViewsCache.set(viewKey, now);

        return { success: true, message: "View tracked immediately" };
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

        if (oldViews.empty) {
            console.log("No old view buffer entries to clean up");
            return null;
        }

        const batch = db.batch();
        oldViews.docs.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();

        console.log(`Cleaned up ${oldViews.size} old view buffer entries`);
        return null;
    } catch (error) {
        console.error("Error cleaning up view buffer:", error);
        return null;
    }
});
