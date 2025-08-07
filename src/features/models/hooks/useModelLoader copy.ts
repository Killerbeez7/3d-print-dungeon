import { useCallback, useSyncExternalStore } from "react";

// Global registry per model URL (lives for browser tab lifetime)
export type ModelStatus = "idle" | "loading" | "loaded";
interface Entry {
  status: ModelStatus;
  progress: number; // 0-1
}

const registry = new Map<string, Entry>();
const listeners = new Map<string, Set<() => void>>();

// Global model loading manager to prevent multiple simultaneous loads
let currentlyLoadingUrl: string | null = null;
const loadingQueue: string[] = [];

function getEntry(url: string): Entry {
  let entry = registry.get(url);
  if (!entry) {
    entry = { status: "idle", progress: 0 };
    registry.set(url, entry);
  }
  return entry;
}

function notify(url: string) {
  listeners.get(url)?.forEach((cb) => cb());
}

// Check if we can start loading a model
function canStartLoading(url: string): boolean {
  // If no model is currently loading, we can start
  if (currentlyLoadingUrl === null) {
    return true;
  }
  
  // If this URL is already loading, we can continue
  if (currentlyLoadingUrl === url) {
    return true;
  }
  
  // Otherwise, we need to wait
  return false;
}

// Start loading a model
function startLoading(url: string): boolean {
  if (canStartLoading(url)) {
    currentlyLoadingUrl = url;
    console.log(`🎯 Global: Starting to load ${url} (currently loading: ${currentlyLoadingUrl})`);
    return true;
  } else {
    // Add to queue if not already there
    if (!loadingQueue.includes(url)) {
      loadingQueue.push(url);
      console.log(`⏳ Global: Queued ${url} (currently loading: ${currentlyLoadingUrl}, queue: ${loadingQueue.join(', ')})`);
    }
    return false;
  }
}

// Finish loading a model
function finishLoading(url: string) {
  if (currentlyLoadingUrl === url) {
    currentlyLoadingUrl = null;
    console.log(`✅ Global: Finished loading ${url}`);
    
    // Start next model in queue
    if (loadingQueue.length > 0) {
      const nextUrl = loadingQueue.shift()!;
      console.log(`🔄 Global: Starting next model in queue: ${nextUrl}`);
      // Trigger the next model to start loading
      const nextEntry = getEntry(nextUrl);
      if (nextEntry.status === "idle") {
        nextEntry.status = "loading";
        nextEntry.progress = 0;
        notify(nextUrl);
      }
    }
  }
}

export function useModelLoader(url: string) {
  // subscribe via useSyncExternalStore so all components stay in sync
  const subscribe = (cb: () => void) => {
    const set = listeners.get(url) ?? new Set();
    set.add(cb);
    listeners.set(url, set);
    return () => set.delete(cb);
  };

  const snapshot = () => getEntry(url);

  const { status, progress } = useSyncExternalStore(subscribe, snapshot, snapshot);

  const markLoading = useCallback(() => {
    const entry = getEntry(url);
    if (entry.status === "idle") {
      // Check if we can start loading
      if (startLoading(url)) {
        entry.status = "loading";
        entry.progress = 0;
        notify(url);
      } else {
        console.log(`⏸️ Global: ${url} is waiting in queue`);
      }
    }
  }, [url]);

  const updateProgress = useCallback(
    (p: number) => {
      const entry = getEntry(url);
      if (entry.status !== "loading") return;
      if (p !== entry.progress) {
        entry.progress = p;
        notify(url);
      }
    },
    [url]
  );

  const markLoaded = useCallback(() => {
    const entry = getEntry(url);
    if (entry.status !== "loaded") {
      entry.status = "loaded";
      entry.progress = 1;
      finishLoading(url);
      notify(url);
    }
  }, [url]);

  return { status, progress, markLoading, updateProgress, markLoaded } as const;
}

// Debug function to check current loading status
export function getLoadingStatus() {
  return {
    currentlyLoading: currentlyLoadingUrl,
    queue: [...loadingQueue],
    registry: Object.fromEntries(registry)
  };
}
