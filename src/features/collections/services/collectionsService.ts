import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteField,
  doc,
  documentId,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "@/config/firebaseConfig";
import { ROUTES } from "@/constants/routeConstants";
import type { ModelData } from "@/features/models/types/model";

/** A private, named list of models (e.g. "Goblin warband"). */
export interface ModelCollection {
  id: string;
  name: string;
  /** Oldest first, as added. */
  modelIds: string[];
  createdAt: number;
  updatedAt: number;
}

export const COLLECTION_NAME_MAX = 60;

export const collectionPath = (id: string) => ROUTES.COLLECTION_DETAILS.replace(":collectionId", id);

// All of a user's collections live in one private document the owner can already write
// (users/{uid}/settings/*). Public collections would need their own rules later.
const collectionsRef = (uid: string) => doc(db, "users", uid, "settings", "collections");

type StoredCollection = Omit<ModelCollection, "id">;

/** Newest activity first. */
export async function listCollections(uid: string): Promise<ModelCollection[]> {
  const snap = await getDoc(collectionsRef(uid));
  const lists = (snap.exists() ? snap.data().lists : undefined) as
    | Record<string, Partial<StoredCollection>>
    | undefined;
  if (!lists) return [];
  return Object.entries(lists)
    .map(([id, item]) => ({
      id,
      name: typeof item.name === "string" ? item.name : "Untitled",
      modelIds: Array.isArray(item.modelIds) ? item.modelIds : [],
      createdAt: Number(item.createdAt) || 0,
      updatedAt: Number(item.updatedAt) || 0,
    }))
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export const cleanCollectionName = (name: string) =>
  name.replace(/\s+/g, " ").trim().slice(0, COLLECTION_NAME_MAX);

export async function createCollection(
  uid: string,
  name: string,
  firstModelId?: string,
): Promise<string> {
  const clean = cleanCollectionName(name);
  if (!clean) throw new Error("A collection needs a name");
  const id = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
  const now = Date.now();
  const item: StoredCollection = {
    name: clean,
    modelIds: firstModelId ? [firstModelId] : [],
    createdAt: now,
    updatedAt: now,
  };
  await setDoc(collectionsRef(uid), { lists: { [id]: item } }, { merge: true });
  return id;
}

export async function renameCollection(uid: string, id: string, name: string): Promise<void> {
  const clean = cleanCollectionName(name);
  if (!clean) throw new Error("A collection needs a name");
  await updateDoc(collectionsRef(uid), {
    [`lists.${id}.name`]: clean,
    [`lists.${id}.updatedAt`]: Date.now(),
  });
}

export async function deleteCollection(uid: string, id: string): Promise<void> {
  await updateDoc(collectionsRef(uid), { [`lists.${id}`]: deleteField() });
}

export async function setModelInCollection(
  uid: string,
  id: string,
  modelId: string,
  included: boolean,
): Promise<void> {
  await updateDoc(collectionsRef(uid), {
    [`lists.${id}.modelIds`]: included ? arrayUnion(modelId) : arrayRemove(modelId),
    [`lists.${id}.updatedAt`]: Date.now(),
  });
}

/**
 * Loads models by id, in the order given. Ids of deleted models are skipped.
 * Firestore takes at most 30 ids per `in` query, so they go in batches.
 */
export async function getModelsByIds(ids: string[]): Promise<ModelData[]> {
  const unique = [...new Set(ids)].filter(Boolean);
  const batches: string[][] = [];
  for (let i = 0; i < unique.length; i += 30) batches.push(unique.slice(i, i + 30));

  const snaps = await Promise.all(
    batches.map((batch) => getDocs(query(collection(db, "models"), where(documentId(), "in", batch)))),
  );
  const byId = new Map<string, ModelData>();
  for (const snap of snaps) {
    for (const d of snap.docs) byId.set(d.id, { ...(d.data() as Omit<ModelData, "id">), id: d.id });
  }
  return unique.map((id) => byId.get(id)).filter((m): m is ModelData => Boolean(m));
}
