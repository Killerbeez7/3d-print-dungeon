import { useState, useCallback } from "react";

// Global state to ensure the script is only fetched and loaded once.
let modelViewerLoaded = false;
let promise: Promise<void> | null = null;

export function useOnDemandModelViewer() {
    const [loaded, setLoaded] = useState(modelViewerLoaded);
    const [loading, setLoading] = useState(false);

    const loadModelViewer = useCallback(async () => {
        if (modelViewerLoaded) {
            setLoaded(true);
            return Promise.resolve();
        }

        if (loading) {
            // Already loading, just wait for it
            return promise || Promise.resolve();
        }

        setLoading(true);

        // If a promise already exists, it means loading has been initiated.
        if (!promise) {
            promise = import("@google/model-viewer").then(() => {
                modelViewerLoaded = true;
                setLoaded(true);
                setLoading(false);
            }).catch((error) => {
                console.error("Failed to load model-viewer:", error);
                setLoading(false);
                throw error;
            });
        }

        return promise || Promise.resolve();
    }, [loading]);

    return {
        loaded,
        loading,
        loadModelViewer
    };
}