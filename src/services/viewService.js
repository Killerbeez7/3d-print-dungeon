import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { httpsCallable, getFunctions } from "firebase/functions";
import { db } from "@/config/firebase";
import { getViewerId } from "@/utils/getViewerId";

const functions = getFunctions();

// 1. Lightweight view tracking - just sends event to buffer
export async function sendViewEvent(modelId, currentUser) {
    if (!modelId) {
        console.warn("sendViewEvent: modelId is required");
        return;
    }

    try {
        const viewerId = await getViewerId(currentUser);
        console.log(`Tracking view event for model: ${modelId}, viewer: ${viewerId}`);

        const trackView = httpsCallable(functions, "trackModelView");
        const result = await trackView({ modelId, viewerId });

        if (result.data.success) {
            console.log("View event tracked:", result.data.message);
        } else {
            console.log("View event skipped:", result.data.reason);
        }

        return result.data;
    } catch (error) {
        // Handle specific error cases
        if (error?.code === "not-found") {
            console.warn("Model not found for view tracking:", modelId);
        } else {
            console.error("Error tracking view event:", error);
        }

        // Don't throw - view tracking should be non-blocking
        return null;
    }
}

// 2. Hook - call from any page that shows a model
export function useViewTracker(modelId, currentUser) {
    useEffect(() => {
        if (!modelId) return;

        // Track view event when component mounts or modelId changes
        sendViewEvent(modelId, currentUser);
    }, [modelId, currentUser?.uid]); // Only re-track if modelId or user ID changes
}

// 3. Hook - simple real-time view count from model document
export function useModelViewCount(modelId) {
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!modelId) {
            setCount(0);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        // Listen to model document for view count changes
        const unsubscribe = onSnapshot(
            doc(db, "models", modelId),
            (docSnapshot) => {
                try {
                    if (docSnapshot.exists()) {
                        const data = docSnapshot.data();
                        setCount(data.views || 0);
                    } else {
                        setCount(0);
                    }
                    setLoading(false);
                    setError(null);
                } catch (err) {
                    console.error("Error reading view count:", err);
                    setError(err);
                    setLoading(false);
                }
            },
            (err) => {
                console.error("Error listening to model document:", err);
                setError(err);
                setLoading(false);
            }
        );

        return () => {
            unsubscribe();
        };
    }, [modelId]);

    return { count, loading, error };
}

// 4. Utility function to get view count via Cloud Function (for one-time queries)
export async function getModelViewCount(modelId) {
    if (!modelId) return 0;

    try {
        const getViewCount = httpsCallable(functions, "getModelViewCount");
        const result = await getViewCount({ modelId });
        return result.data.viewCount || 0;
    } catch (error) {
        console.error("Error getting view count:", error);
        return 0;
    }
}
