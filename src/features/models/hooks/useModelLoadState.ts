import { useSyncExternalStore } from "react";

// -----------------------------
// Simple pub/sub store per model URL
// -----------------------------
export type ModelLoadStatus = "idle" | "loading" | "loaded";

const statusMap = new Map<string, ModelLoadStatus>();
const listeners = new Map<string, Set<() => void>>();

function getStatus(url: string): ModelLoadStatus {
  return statusMap.get(url) ?? "idle";
}

function setStatus(url: string, status: ModelLoadStatus) {
  statusMap.set(url, status);
  listeners.get(url)?.forEach((cb) => cb());
}

function subscribe(url: string, cb: () => void) {
  let set = listeners.get(url);
  if (!set) {
    set = new Set();
    listeners.set(url, set);
  }
  set.add(cb);
  return () => set!.delete(cb);
}

export function useModelLoadState(url: string) {
  const status = useSyncExternalStore(
    (cb) => subscribe(url, cb),
    () => getStatus(url),
    () => "idle"
  );

  const markLoading = () => setStatus(url, "loading");
  const markLoaded = () => setStatus(url, "loaded");

  return { status, markLoading, markLoaded } as const;
}
