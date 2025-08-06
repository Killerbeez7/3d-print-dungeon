import { useState, useCallback } from "react";

// Global state to ensure Three.js model-viewer library is only loaded once
let threeJsImported = false;
let importPromise: Promise<void> | null = null;

export function useThreeJsImporter() {
    const [threeImported, setThreeImported] = useState(threeJsImported);
    const [importing, setImporting] = useState(false);

    const importThreeJs = useCallback(async () => {
        // If already imported, just update local state
        if (threeJsImported) {
            setThreeImported(true);
            return Promise.resolve();
        }

        // If already importing, wait for existing promise
        if (importing) {
            return importPromise || Promise.resolve();
        }

        setImporting(true);

        // Create import promise only once
        if (!importPromise) {
            importPromise = import("@google/model-viewer").then(() => {
                threeJsImported = true;
                setThreeImported(true);
                setImporting(false);
            }).catch((error) => {
                console.error("Failed to import Three.js model-viewer library:", error);
                setImporting(false);
                throw error;
            });
        }

        return importPromise || Promise.resolve();
    }, [importing]);

    return {
        threeImported,
        importing,
        importThreeJs
    };
}