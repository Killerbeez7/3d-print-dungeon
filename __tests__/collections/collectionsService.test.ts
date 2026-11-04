import { beforeEach, describe, expect, it, vi } from "vitest";

const store = vi.hoisted(() => ({
  doc: undefined as Record<string, unknown> | undefined,
  models: {} as Record<string, { name: string }>,
  inQueries: [] as string[][],
  writes: [] as { kind: string; data: unknown }[],
}));

vi.mock("firebase/firestore", () => ({
  doc: (...path: unknown[]) => ({ path: path.slice(1).join("/") }),
  collection: () => ({}),
  documentId: () => "__id__",
  where: (_field: string, _op: string, ids: string[]) => ({ ids }),
  query: (_c: unknown, w: { ids: string[] }) => w,
  getDoc: async () => ({ exists: () => Boolean(store.doc), data: () => store.doc }),
  getDocs: async (q: { ids: string[] }) => {
    store.inQueries.push(q.ids);
    return {
      docs: q.ids.filter((id) => store.models[id]).map((id) => ({ id, data: () => store.models[id] })),
    };
  },
  setDoc: async (_ref: unknown, data: unknown) => void store.writes.push({ kind: "set", data }),
  updateDoc: async (_ref: unknown, data: unknown) => void store.writes.push({ kind: "update", data }),
  arrayUnion: (v: string) => ({ union: v }),
  arrayRemove: (v: string) => ({ remove: v }),
  deleteField: () => "DELETE",
}));

import {
  cleanCollectionName,
  createCollection,
  getModelsByIds,
  listCollections,
  setModelInCollection,
} from "@/features/collections/services/collectionsService";

beforeEach(() => {
  store.doc = undefined;
  store.models = {};
  store.inQueries = [];
  store.writes = [];
});

describe("collections service", () => {
  it("tidies names and caps them at 60 characters", () => {
    expect(cleanCollectionName("  Goblin   warband ")).toBe("Goblin warband");
    expect(cleanCollectionName("x".repeat(80))).toHaveLength(60);
  });

  it("lists collections newest activity first and tolerates odd data", async () => {
    store.doc = {
      lists: {
        a: { name: "Old", modelIds: ["m1"], createdAt: 1, updatedAt: 10 },
        b: { name: "New", modelIds: ["m2", "m3"], createdAt: 2, updatedAt: 20 },
        c: { modelIds: "broken" },
      },
    };
    const lists = await listCollections("u1");
    expect(lists.map((l) => l.name)).toEqual(["New", "Old", "Untitled"]);
    expect(lists[2].modelIds).toEqual([]);
  });

  it("returns nothing when the user has no collections yet", async () => {
    expect(await listCollections("u1")).toEqual([]);
  });

  it("creates a collection with the first model in it", async () => {
    const id = await createCollection("u1", " Tavern scene ", "m9");
    const write = store.writes[0];
    expect(write.kind).toBe("set");
    const item = (write.data as { lists: Record<string, { name: string; modelIds: string[] }> }).lists[id];
    expect(item.name).toBe("Tavern scene");
    expect(item.modelIds).toEqual(["m9"]);
  });

  it("refuses an empty name", async () => {
    await expect(createCollection("u1", "   ")).rejects.toThrow();
    expect(store.writes).toHaveLength(0);
  });

  it("adds and removes a model with array operations", async () => {
    await setModelInCollection("u1", "c1", "m1", true);
    await setModelInCollection("u1", "c1", "m1", false);
    expect((store.writes[0].data as Record<string, unknown>)["lists.c1.modelIds"]).toEqual({ union: "m1" });
    expect((store.writes[1].data as Record<string, unknown>)["lists.c1.modelIds"]).toEqual({ remove: "m1" });
  });

  it("loads models in the order asked, in batches of 30, skipping deleted ones", async () => {
    const ids = Array.from({ length: 65 }, (_, i) => `m${i}`);
    for (const id of ids) if (id !== "m5") store.models[id] = { name: id };
    const models = await getModelsByIds([...ids, "m1"]);
    expect(store.inQueries.map((q) => q.length)).toEqual([30, 30, 5]);
    expect(models).toHaveLength(64);
    expect(models[0].id).toBe("m0");
    expect(models[5].id).toBe("m6");
  });
});
