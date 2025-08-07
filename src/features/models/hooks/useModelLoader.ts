import { useCallback, useSyncExternalStore, useEffect } from "react";

export type ModelStatus = "idle" | "loading" | "loaded" | "error";

interface Entry {
    status: ModelStatus;
    progress: number; // 0-1
    controller?: AbortController;
    blob?: Blob; // Cache model data
    lastAccessed?: number; // Track when model was last accessed
}

const registry = new Map<string, Entry>();
const listeners = new Map<string, Set<() => void>>();
const modelCache = new Map<string, Blob>();



function getEntry(url: string): Entry {
    let entry = registry.get(url);
    if (!entry) {
        entry = {
            status: "idle",
            progress: 0,
            lastAccessed: Date.now()
        };
        registry.set(url, entry);
    } else {
        // Update last accessed time
        entry.lastAccessed = Date.now();
    }
    return entry;
}

function notify(url: string) {
    const set = listeners.get(url);
    if (set) {
        console.log(`🔔 Notifying ${set.size} listeners for ${url}`);
        const entry = getEntry(url);
        console.log(`🔍 Current entry state:`, { status: entry.status, progress: entry.progress });
        set.forEach((cb) => cb());
    } else {
        console.log(`⚠️ No listeners found for ${url}`);
    }
}

// Cleanup function to reset model state
function resetModelState(url: string) {
    const entry = getEntry(url);
    if (entry.status === "loading" && entry.controller) {
        entry.controller.abort();
    }
    entry.status = "idle";
    entry.progress = 0;
    delete entry.controller;
    notify(url);
}

export function useModelLoader(url: string) {
    const subscribe = (cb: () => void) => {
        const set = listeners.get(url) ?? new Set();
        set.add(cb);
        listeners.set(url, set);
        return () => set.delete(cb);
    };

    const snapshot = () => {
        const entry = getEntry(url);
        console.log("📸 Snapshot called, returning:", { status: entry.status, progress: entry.progress });
        return entry;
    };
    const { status, progress } = useSyncExternalStore(subscribe, snapshot, snapshot);

    // Simple cleanup - reset model state when component unmounts
    useEffect(() => {
        return () => {
            // Reset model state when component unmounts (user navigates away)
            resetModelState(url);
        };
    }, [url]);

    const markLoading = useCallback(async () => {
        console.log("🔄 markLoading called for:", url);
        const entry = getEntry(url);
        if (entry.status !== "idle") {
            console.log("⏭️ Model not idle, current status:", entry.status);
            return;
        }

        // Check if model is already cached
        if (modelCache.has(url)) {
            console.log("💾 Model found in cache, marking as loaded");
            entry.status = "loaded";
            entry.progress = 1;
            entry.blob = modelCache.get(url);
            notify(url);
            return;
        }

        console.log("📥 Starting fresh model download");
        const controller = new AbortController();
        entry.status = "loading";
        entry.progress = 0;
        entry.controller = controller;
        notify(url);

        try {
            const res = await fetch(url, { signal: controller.signal });

            if (!res.ok) {
                throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            }

            const reader = res.body?.getReader();
            const contentLength = +res.headers.get("Content-Length")!;

            if (!reader) {
                throw new Error("No response body reader available");
            }

            let receivedLength = 0;
            const chunks: Uint8Array[] = [];

            let lastReportedProgress = 0; // Track last reported progress
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                if (value) {
                    chunks.push(value);
                    receivedLength += value.length;

                    // Calculate progress with fallback for unknown content length
                    const progress = contentLength > 0
                        ? receivedLength / contentLength
                        : Math.min(receivedLength / 1000000, 0.95); // Estimate for unknown size

                    entry.progress = Math.min(progress, 0.99); // Cap at 99% until fully loaded
                    const currentPercent = Math.round(entry.progress * 100); // Round to whole percent
                    const lastPercent = Math.round(lastReportedProgress * 100);

                    // Only notify and log when progress changes by at least 1%
                    if (currentPercent > lastPercent) {
                        console.log("📊 Download progress:", `${currentPercent}%`);
                        console.log("🔍 Entry progress before notify:", entry.progress);
                        notify(url);
                        console.log("🔍 Entry progress after notify:", entry.progress);
                        lastReportedProgress = entry.progress;
                    }
                }
            }

            const blob = new Blob(chunks);
            entry.status = "loaded";
            entry.progress = 1;
            entry.blob = blob;
            modelCache.set(url, blob);
            notify(url);

            console.log(`✅ Model loaded and cached: ${url}`);
        } catch (err) {
            if (controller.signal.aborted) {
                console.log(`❌ Loading aborted for ${url}`);
                // Don't set error status for aborted requests
                return;
            } else {
                console.error(`❌ Error loading ${url}`, err);
                entry.status = "error";
                entry.progress = 0;
                notify(url);
            }
        }
    }, [url]);

    const cancelLoading = useCallback(() => {
        const entry = getEntry(url);
        if (entry.controller) {
            entry.controller.abort();
            entry.status = "idle";
            entry.progress = 0;
            delete entry.controller;
            notify(url);
            console.log(`🛑 Loading cancelled for ${url}`);
        }
    }, [url]);

    const resetToIdle = useCallback(() => {
        const entry = getEntry(url);
        if (entry.status === "loading" && entry.controller) {
            entry.controller.abort();
        }
        entry.status = "idle";
        entry.progress = 0;
        delete entry.controller;
        notify(url);
    }, [url]);

    const getBlob = useCallback(() => {
        const entry = getEntry(url);
        return entry.blob || null;
    }, [url]);

    const updateProgress = useCallback((value: number) => {
        const entry = getEntry(url);
        if (entry.status === "loading") {
            entry.progress = Math.max(0, Math.min(1, value));
            notify(url);
        }
    }, [url]);

    const markLoaded = useCallback(() => {
        console.log("✅ markLoaded called for:", url);
        const entry = getEntry(url);
        entry.status = "loaded";
        entry.progress = 1;
        notify(url);
        console.log("✅ Model marked as loaded, status updated");
    }, [url]);

    const isCached = modelCache.has(url);

    return {
        status,
        progress,
        markLoading,
        cancelLoading,
        resetToIdle,
        getBlob,
        isCached,
        updateProgress,
        markLoaded,
    } as const;
}

// Utility function to clear cache (useful for memory management)
export function clearModelCache() {
    modelCache.clear();
    console.log("🧹 Model cache cleared");
}

// Utility function to get cache stats
export function getCacheStats() {
    return {
        cachedModels: modelCache.size,
        totalRegistryEntries: registry.size
    };
}

// Debug function to log current state
export function debugModelLoader(url?: string) {
    if (url) {
        const entry = registry.get(url);
        const isCached = modelCache.has(url);

        console.log(`�� Model Debug for ${url}:`, {
            status: entry?.status,
            progress: entry?.progress,
            isCached,
            lastAccessed: entry?.lastAccessed
        });
    } else {
        console.log("🔍 Model Loader Debug:", {
            registry: Object.fromEntries(registry),
            cache: Array.from(modelCache.keys())
        });
    }
}
