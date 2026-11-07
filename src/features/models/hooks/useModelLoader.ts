import { useCallback, useSyncExternalStore, useEffect } from "react";

export type ModelStatus = "idle" | "loading" | "loaded" | "error";

interface Entry {
    status: ModelStatus;
    progress: number; // 0-1
    totalBytes: number; // 0 when the server doesn't say
    controller?: AbortController;
    blob?: Blob; // Cache model data
    lastAccessed?: number; // Track when model was last accessed
    /** The bytes received so far (buffer may be larger than `received`). */
    buffer?: Uint8Array<ArrayBuffer>;
    received?: number;
}

const registry = new Map<string, Entry>();
const listeners = new Map<string, Set<() => void>>();
const modelCache = new Map<string, Uint8Array<ArrayBuffer>>();

// Track currently downloading URLs (for debugging/cancellation only)
const activeDownloads = new Set<string>();

async function startDownload(url: string) {
    const entry = getEntry(url);
    if (entry.status !== "idle") return;

    const controller = new AbortController();
    entry.controller = controller;
    entry.status = "loading";
    entry.progress = 0;
    entry.totalBytes = 0;
    activeDownloads.add(url);
    notify(url);

    try {
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }

        const reader = res.body?.getReader();
        const contentLength = +(res.headers.get("Content-Length") || 0);
        entry.totalBytes = contentLength;
        if (!reader) {
            throw new Error("No response body reader available");
        }

        let receivedLength = 0;
        // One growing buffer, so the viewer can read what has arrived without copying
        // (a packed preview's light level can be shown before the rest is in).
        let buffer = new Uint8Array(contentLength > 0 ? contentLength : 1 << 20);
        entry.buffer = buffer;
        entry.received = 0;
        let lastReportedProgress = 0;

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            if (value) {
                if (receivedLength + value.length > buffer.length) {
                    const grown = new Uint8Array(Math.max(buffer.length * 2, receivedLength + value.length));
                    grown.set(buffer.subarray(0, receivedLength));
                    buffer = grown;
                    entry.buffer = buffer;
                }
                buffer.set(value, receivedLength);
                receivedLength += value.length;
                entry.received = receivedLength;

                // Without a size, approach 95% gradually (half way at 3 MB).
                const progress =
                    contentLength > 0
                        ? receivedLength / contentLength
                        : 0.95 * (receivedLength / (receivedLength + 3_000_000));

                entry.progress = Math.min(progress, 0.99);

                const currentPercent = Math.round(entry.progress * 100);
                const lastPercent = Math.round(lastReportedProgress * 100);

                if (currentPercent > lastPercent) {
                    notify(url);
                    lastReportedProgress = entry.progress;
                }
            }
        }

        const bytes = buffer.subarray(0, receivedLength);
        entry.buffer = bytes;
        entry.received = receivedLength;
        entry.status = "loaded";
        entry.progress = 1;
        entry.blob = new Blob([bytes]);
        modelCache.set(url, bytes);
        notify(url);
    } catch (err) {
        if (controller.signal.aborted) {
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
            totalBytes: 0,
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
    let lastSnap: { status: ModelStatus; progress: number; totalBytes: number } | null = null;
    const snapshot = () => {
        const entry = getEntry(url);
        const rounded = Math.round(entry.progress * 100) / 100; // 2-dec precision
        if (
            lastSnap &&
            lastSnap.status === entry.status &&
            lastSnap.progress === rounded &&
            lastSnap.totalBytes === entry.totalBytes
        ) {
            return lastSnap; // same object -> no update
        }
        lastSnap = { status: entry.status, progress: rounded, totalBytes: entry.totalBytes } as const;
        return lastSnap;
    };
    const { status, progress, totalBytes } = useSyncExternalStore(subscribe, snapshot, snapshot);

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
        const cached = modelCache.get(url);
        if (cached) {
            entry.status = "loaded";
            entry.progress = 1;
            entry.buffer = cached;
            entry.received = cached.length;
            entry.blob = new Blob([cached]);
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

    /** What has arrived so far (all of it once loaded), or null before the download starts. */
    const getBytes = useCallback((): Uint8Array | null => {
        const entry = getEntry(url);
        return entry.buffer ? entry.buffer.subarray(0, entry.received ?? 0) : null;
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

    /** Drops a downloaded file the viewer couldn't open, so a retry downloads it again. */
    const forget = useCallback(() => {
        modelCache.delete(url);
        const entry = getEntry(url);
        if (entry.controller) entry.controller.abort();
        entry.status = "idle";
        entry.progress = 0;
        delete entry.blob;
        delete entry.buffer;
        delete entry.received;
        delete entry.controller;
        notify(url);
    }, [url]);

    const isCached = modelCache.has(url);

    return {
        status,
        progress,
        totalBytes,
        forget,
        markLoading,
        cancelLoading,
        resetToIdle,
        getBlob,
        getBytes,
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
