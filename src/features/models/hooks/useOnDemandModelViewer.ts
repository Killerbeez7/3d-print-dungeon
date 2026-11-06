import { useState, useCallback } from "react";

// Global state to ensure the 3D viewer (three.js and the preview viewer) is only loaded once
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
            importPromise = import("@/features/models/preview3d/PreviewMeshViewer").then(() => {
                threeJsImported = true;
                setThreeImported(true);
                setImporting(false);
            }).catch((error) => {
                console.error("Failed to load the 3D viewer:", error);
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