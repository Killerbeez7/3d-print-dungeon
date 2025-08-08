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

// Track currently downloading URLs (for debugging/cancellation only)
const activeDownloads = new Set<string>();

async function startDownload(url: string) {
    const entry = getEntry(url);
    if (entry.status !== "idle") return;

    const controller = new AbortController();
    entry.controller = controller;
    entry.status = "loading";
    entry.progress = 0;
    activeDownloads.add(url);
    notify(url);

    try {
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }

        const reader = res.body?.getReader();
        const contentLength = +(res.headers.get("Content-Length") || 0);
        if (!reader) {
            throw new Error("No response body reader available");
        }

        let receivedLength = 0;
        const chunks: Uint8Array[] = [];
        let lastReportedProgress = 0;

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            if (value) {
                chunks.push(value);
                receivedLength += value.length;

                const progress = contentLength > 0
                    ? receivedLength / contentLength
                    : Math.min(receivedLength / 1000000, 0.95);

                entry.progress = Math.min(progress, 0.99);
                const currentPercent = Math.round(entry.progress * 100);
                const lastPercent = Math.round(lastReportedProgress * 100);
                if (currentPercent > lastPercent) {
                    notify(url);
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
    } catch (err) {
        if (controller.signal.aborted) {
            // console.log(`❌ Loading aborted for ${url}`);
            // Leave status as idle on abort
            entry.status = "idle";
            entry.progress = 0;
        } else {
            console.error(`❌ Error loading ${url}`, err);
            entry.status = "error";
            entry.progress = 0;
        }
        notify(url);
    } finally {
        activeDownloads.delete(url);
        delete entry.controller;
    }
}



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
        // console.log(`🔔 Notifying ${set.size} listeners for ${url}`);
        // const entry = getEntry(url);
        // console.log(`🔍 Current entry state:`, { status: entry.status, progress: entry.progress });
        set.forEach((cb) => cb());
    } else {
        // console.log(`⚠️ No listeners found for ${url}`);
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

    // Cache snapshot to avoid returning new reference when data hasn't changed
    let lastSnap: { status: ModelStatus; progress: number } | null = null;
    const snapshot = () => {
        const entry = getEntry(url);
        const rounded = Math.round(entry.progress * 100) / 100; // 2-dec precision
        if (lastSnap && lastSnap.status === entry.status && lastSnap.progress === rounded) {
            return lastSnap; // same object -> no update
        }
        lastSnap = { status: entry.status, progress: rounded } as const;
        return lastSnap;
    };
    const { status, progress } = useSyncExternalStore(subscribe, snapshot, snapshot);

    // Simple cleanup - reset model state when component unmounts
    useEffect(() => {
        return () => {
            // Reset model state when component unmounts (user navigates away)
            resetModelState(url);
        };
    }, [url]);

    const markLoading = useCallback(() => {
        const entry = getEntry(url);
        if (entry.status !== "idle") {
            return;
        }

        // If cached, mark as loaded instantly
        if (modelCache.has(url)) {
            entry.status = "loaded";
            entry.progress = 1;
            entry.blob = modelCache.get(url);
            notify(url);
            return;
        }

        // Start download
        void startDownload(url);
    }, [url]);



    const cancelLoading = useCallback(() => {
        const entry = getEntry(url);
        if (entry.controller) {
            entry.controller.abort();
            activeDownloads.delete(url);
            entry.status = "idle";
            entry.progress = 0;
            delete entry.controller;
            notify(url);
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
        if (entry.status !== "loading") return;

        const clamped = Math.max(0, Math.min(1, value));
        // Only update when progress changes by at least 1% (to avoid excessive renders)
        const prevPercent = Math.round(entry.progress * 100);
        const nextPercent = Math.round(clamped * 100);
        if (nextPercent === prevPercent) return;

        entry.progress = clamped;
        notify(url);
    }, [url]);

    const markLoaded = useCallback(() => {
        const entry = getEntry(url);
        entry.status = "loaded";
        entry.progress = 1;
        notify(url);
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
}

// Utility function to get cache stats
export function getCacheStats() {
    return {
        cachedModels: modelCache.size,
        totalRegistryEntries: registry.size
    };
}
