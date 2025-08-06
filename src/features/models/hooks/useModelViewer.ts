import { useState, useEffect } from "react";

// Global state to ensure the script is only fetched and loaded once.
let modelViewerLoaded = false;
let promise: Promise<void> | null = null;

export function useModelViewer(after: "idle" | "timeout" = "idle"): boolean {
    const [loaded, setLoaded] = useState(modelViewerLoaded);

    useEffect(() => {
        if (modelViewerLoaded) {
            setLoaded(true);
            return;
        }

        const load = () => {
            // If a promise already exists, it means loading has been initiated.
            // We just need to wait for it to resolve.
            if (!promise) {
                promise = import("@google/model-viewer").then(() => {
                    modelViewerLoaded = true;
                });
            }

            promise.then(() => setLoaded(true)).catch(console.error);
        };

        if (after === "idle" && typeof window !== "undefined" && "requestIdleCallback" in window) {
            interface IdleRequestCallback {
                (deadline: IdleDeadline): void;
            }
            interface IdleDeadline {
                readonly didTimeout: boolean;
                timeRemaining(): number;
            }
            interface WindowWithIdleCallback extends Window {
                requestIdleCallback: (callback: IdleRequestCallback, options?: { timeout: number }) => number;
            }

            const win = window as unknown as WindowWithIdleCallback;
            win.requestIdleCallback(load);
        } else {
            // Fallback for timeout or if requestIdleCallback is not supported.
            setTimeout(load, 2000);
        }
    }, [after]);

    return loaded;
} 