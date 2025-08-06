import { useCallback, useSyncExternalStore } from "react";

// Global registry per model URL (lives for browser tab lifetime)
export type ModelStatus = "idle" | "loading" | "loaded";
interface Entry {
  status: ModelStatus;
  progress: number; // 0-1
}

const registry = new Map<string, Entry>();
const listeners = new Map<string, Set<() => void>>();

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
      entry.status = "loading";
      entry.progress = 0;
      notify(url);
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
      notify(url);
    }
  }, [url]);

  return { status, progress, markLoading, updateProgress, markLoaded } as const;
}
