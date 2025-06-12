import {
    doc,
    setDoc,
    collection,
    query,
    where,
    getDocs,
    writeBatch,
} from "firebase/firestore";
import { db, auth } from "../config/firebase";
import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { refreshIdToken } from "../utils/auth/refreshIdToken";

// 30 minutes
const VIEW_COOLDOWN_MS = 30 * 60_000;

// generate or get a stable localStorage-based ID
function getAnonymousId() {
    const key = "anon_user_id";
    let anonId = localStorage.getItem(key);
    if (!anonId) {
        anonId = crypto.randomUUID();
        localStorage.setItem(key, anonId);
    }
    return anonId;
}

// check if user has recently viewed this model
async function hasRecentView(modelId, userId) {
    try {
        const recentViews = await getDocs(
            query(
                collection(db, "viewTrackers"),
                where("modelId", "==", modelId),
                where("userId", "==", userId)
            )
        );

        if (recentViews.empty) return false;

        // Check if any view is within the cooldown period
        const now = Date.now();
        for (const viewDoc of recentViews.docs) {
            const viewData = viewDoc.data();
            const createdAt =
                viewData.createdAt?.toDate?.() || new Date(viewData.createdAt);
            if (now - createdAt.getTime() < VIEW_COOLDOWN_MS) {
                return true;
            }
        }
        return false;
    } catch (error) {
        console.error("Error checking recent views:", error);
        return false; // Allow the view if we can't check
    }
}

// trakc view if user has not viewed in the last 30 mins
export async function trackView(modelId) {
    if (!modelId) return;

    const currentUser = auth.currentUser;

    // If logged in, use the real ID, else use the anonymous ID
    const userId = currentUser ? currentUser.uid : getAnonymousId();
    // for display. Could store displayName or "Anonymous"
    const userDisplayName = currentUser
        ? currentUser.displayName || currentUser.email || "User"
        : "Anonymous";

    // check if there is a recent view doc
    const recentlyViewed = await hasRecentView(modelId, userId);
    if (recentlyViewed) {
        console.log("Skipping: user still in cooldown for this model.");
        return false;
    }

    // if not in cooldown, increment the view count
    const docId = `${modelId}_${userId}_${Date.now()}`;
    await setDoc(doc(db, "viewTrackers", docId), {
        modelId,
        userId,
        userDisplayName,
        createdAt: new Date(),
    });

    console.log("View tracked:", docId);
    return true;
}

// automatically track a view whenever the user visits the component
export function useViewTracker(modelId) {
    const { currentUser } = useAuth();

    useEffect(() => {
        if (!modelId) return;
        trackView(modelId).catch(console.error);
    }, [modelId, currentUser]);
}

// clean up all view tracking data (admin panel script)
export const cleanupAllViews = async () => {
    try {
        const claims = await refreshIdToken();
        if (!claims.admin) {
            throw new Error("You must be an admin to perform this action");
        }
        // Delete all documents in viewTrackers collection
        const viewTrackersRef = collection(db, "viewTrackers");
        const viewTrackersSnapshot = await getDocs(viewTrackersRef);
        // Delete all documents in userViews collection
        const userViewsRef = collection(db, "userViews");
        const userViewsSnapshot = await getDocs(userViewsRef);
        // Get all models to reset their view counts
        const modelsRef = collection(db, "models");
        const modelsSnapshot = await getDocs(modelsRef);
        // Use batched writes for better performance
        const batch = writeBatch(db);

        // Delete view trackers
        viewTrackersSnapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });

        // Delete user views
        userViewsSnapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });

        // Reset view counts in models
        modelsSnapshot.docs.forEach((doc) => {
            batch.update(doc.ref, { views: 0 });
        });
        await batch.commit();
        console.log("Successfully cleaned up all view data");
        return true;
    } catch (error) {
        console.error("Error cleaning up views:", error);
        throw error;
    }
};
