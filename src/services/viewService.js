import { doc, setDoc, collection, query, where, getDocs, getDoc, writeBatch } from "firebase/firestore";
import { db, auth } from "../config/firebase";
import { useEffect } from "react";
import { useAuth } from "../contexts/authContext";

// 30 minutes
const VIEW_COOLDOWN_MS = 30 * 60_000;

/**
 * Generate or get a stable localStorage-based ID.
 * This is how we differentiate truly anonymous users.
 */
function getAnonymousId() {
    const key = "anon_user_id";
    let anonId = localStorage.getItem(key);
    if (!anonId) {
        anonId = crypto.randomUUID(); // or any UUID generator
        localStorage.setItem(key, anonId);
    }
    return anonId;
}

/**
 * Check if there's a recent doc in viewTrackers for this (modelId,userId) within the past 30 minutes
 */
async function hasRecentView(modelId, userId) {
    // 1) Compute the cutoff time
    const cutoffTime = Date.now() - VIEW_COOLDOWN_MS;

    // 2) Query Firestore for docs with modelId,userId & timestamp >= cutoff
    const viewTrackersRef = collection(db, "viewTrackers");
    const q = query(
        viewTrackersRef,
        where("modelId", "==", modelId),
        where("userId", "==", userId),
        where("createdAt", ">=", new Date(cutoffTime))
    );

    const snapshot = await getDocs(q);
    // If any doc is found, it means we already recorded a view in the last 30 mins
    return !snapshot.empty;
}

/**
 * Track a view for a specific model if the user hasn't viewed it in the last 30 mins
 */
export async function trackView(modelId) {
    if (!modelId) return;

    const currentUser = auth.currentUser;

    // 1) Use real UID if logged in, else use stable "anon" ID from localStorage
    const userId = currentUser ? currentUser.uid : getAnonymousId();
    // Just for display. Could store displayName or "Anonymous" – up to you.
    const userDisplayName = currentUser
        ? currentUser.displayName || currentUser.email || "User"
        : "Anonymous";

    // 2) Check if there's a recent view doc
    const recentlyViewed = await hasRecentView(modelId, userId);
    if (recentlyViewed) {
        console.log("Skipping: user still in cooldown for this model.");
        return false;
    }

    // 3) Not in cooldown, create a doc (this triggers your Cloud Function to increment `views`)
    const docId = `${modelId}_${userId}_${Date.now()}`;
    await setDoc(doc(db, "viewTrackers", docId), {
        modelId,
        userId,
        userDisplayName,
        createdAt: new Date(), // or serverTimestamp() if you prefer
    });

    console.log("View tracked:", docId);
    return true;
}

/**
 * React Hook: automatically track a view whenever the user visits the component
 */
export function useViewTracker(modelId) {
    const { user } = useAuth();

    useEffect(() => {
        if (!modelId) return;
        trackView(modelId).catch(console.error);
    }, [modelId, user]);
}

// Check if the current user is an admin
const checkAdminStatus = async (userId) => {
    if (!userId) return false;
    const adminDoc = await getDoc(doc(db, "admins", userId));
    return adminDoc.exists();
};

//  Clean up all view tracking data (for testing purposes only)
export const cleanupAllViews = async () => {
    try {
        const user = auth.currentUser;
        if (!user) {
            throw new Error("You must be logged in to perform this action");
        }
        const isAdmin = await checkAdminStatus(user.uid);
        if (!isAdmin) {
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
