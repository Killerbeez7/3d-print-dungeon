import { beforeEach, describe, expect, it, vi } from "vitest";

const data = vi.hoisted(() => ({
  models: [] as Record<string, unknown>[],
  docs: {} as Record<string, Record<string, unknown> | undefined>,
  modelQueries: 0,
}));

vi.mock("firebase/firestore", () => ({
  collection: () => ({}),
  orderBy: () => ({}),
  limit: () => ({}),
  query: () => ({}),
  doc: (_db: unknown, ...path: string[]) => path.join("/"),
  getDocs: async () => {
    data.modelQueries += 1;
    return { docs: data.models.map((m, i) => ({ id: `m${i}`, data: () => m })) };
  },
  getDoc: async (path: string) => ({ exists: () => Boolean(data.docs[path]), data: () => data.docs[path] }),
}));

import {
  clearArtistDirectoryCache,
  filterArtists,
  loadArtistDirectory,
  sortArtists,
} from "@/features/artists/services/artistDirectory";

beforeEach(() => {
  clearArtistDirectoryCache();
  data.modelQueries = 0;
  data.models = [
    { uploaderId: "a", renderPrimaryUrl: "https://x/1.png", createdAt: 300 },
    { uploaderId: "b", renderPrimaryUrl: "https://x/2.png", createdAt: 200 },
    { uploaderId: "a", renderPrimaryUrl: "https://x/1.png", createdAt: 100 },
    { uploaderId: "c", uploaderUsername: "Ghost", createdAt: 50 },
    { uploaderId: "d", uploaderUsername: "Legacy", createdAt: 40 },
    { renderPrimaryUrl: "https://x/none.png", createdAt: 10 },
  ];
  data.docs = {
    "users/a/public/data": { username: "anna", displayName: "Anna", bio: "Dragons", stats: { followersCount: 1 } },
    "users/b/public/data": { username: "bob", displayName: "Bob", stats: { followersCount: 9 } },
    // c: no public profile (deleted account)
    "users/d/public/data": { displayName: "Dee", stats: { followersCount: 0 } },
    "usernames/legacy": { uid: "d" },
  };
});

describe("artist directory", () => {
  it("lists uploaders with a profile, counting their models and de-duplicating previews", async () => {
    const artists = await loadArtistDirectory();
    const anna = artists.find((a) => a.uid === "a")!;
    expect(artists.map((a) => a.uid).sort()).toEqual(["a", "b", "d"]);
    expect(anna.modelCount).toBe(2);
    expect(anna.stats?.uploadsCount).toBe(2);
    expect(anna.previews).toEqual(["https://x/1.png"]);
    expect(anna.latestUploadAt).toBe(300);
  });

  it("uses a model's username only when the registry confirms it is the same account", async () => {
    data.docs["usernames/legacy"] = { uid: "someone-else" };
    const artists = await loadArtistDirectory();
    expect(artists.find((a) => a.uid === "d")).toBeUndefined();

    clearArtistDirectoryCache();
    data.docs["usernames/legacy"] = { uid: "d" };
    expect((await loadArtistDirectory()).find((a) => a.uid === "d")?.username).toBe("Legacy");
  });

  it("is built once and shared until the cache expires", async () => {
    await loadArtistDirectory();
    await loadArtistDirectory();
    expect(data.modelQueries).toBe(1);
  });

  it("sorts and searches", async () => {
    const artists = await loadArtistDirectory();
    expect(sortArtists(artists, "models")[0].uid).toBe("a");
    expect(sortArtists(artists, "followers")[0].uid).toBe("b");
    expect(sortArtists(artists, "name").map((a) => a.displayName)).toEqual(["Anna", "Bob", "Dee"]);
    expect(filterArtists(artists, "drag").map((a) => a.uid)).toEqual(["a"]);
    expect(filterArtists(artists, "  ")).toHaveLength(3);
  });
});
