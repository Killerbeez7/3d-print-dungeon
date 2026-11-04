import { collection, doc, getDoc, getDocs, limit, orderBy, query, type Timestamp } from "firebase/firestore";

import { db } from "@/config/firebaseConfig";
import type { PublicProfileView } from "@/features/user/profile";
import type { ArtistData } from "../types/artists";

/** An artist is anyone with a model listed. */
export interface DirectoryArtist extends ArtistData {
  uid: string;
  modelCount: number;
  /** Time of their newest upload, in ms. */
  latestUploadAt: number;
  /** Render images of up to three of their newest models. */
  previews: string[];
}

export type ArtistSort = "models" | "recent" | "followers" | "name";

// Upper bound on models read to build the list. Past this, the list should come from a
// server-kept index instead (see TODO.md).
const MODEL_SCAN_LIMIT = 1000;
const CACHE_MS = 5 * 60_000;

interface ModelRow {
  uploaderId?: string;
  uploaderUsername?: string;
  uploaderDisplayName?: string;
  renderPrimaryUrl?: string | null;
  createdAt?: Timestamp | Date | number | string | null;
}

const toMillis = (value: ModelRow["createdAt"]): number => {
  if (!value) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "string") return Date.parse(value) || 0;
  if (value instanceof Date) return value.getTime();
  return typeof value.toMillis === "function" ? value.toMillis() : 0;
};

/**
 * Some older profiles have no username stored. Their models carry one; use it only if the
 * username registry says it belongs to this same account, so the card never links to someone else.
 */
async function confirmedUsername(uid: string, candidate?: string): Promise<string | null> {
  const name = candidate?.trim().toLowerCase();
  if (!name) return null;
  try {
    const snap = await getDoc(doc(db, "usernames", name));
    return snap.exists() && snap.data().uid === uid ? candidate!.trim() : null;
  } catch {
    return null;
  }
}

async function buildDirectory(): Promise<DirectoryArtist[]> {
  // One query for the models (already public), grouped by uploader...
  const snap = await getDocs(query(collection(db, "models"), orderBy("createdAt", "desc"), limit(MODEL_SCAN_LIMIT)));
  const byUploader = new Map<string, { rows: ModelRow[] }>();
  for (const d of snap.docs) {
    const row = d.data() as ModelRow;
    if (!row.uploaderId) continue;
    const entry = byUploader.get(row.uploaderId) ?? { rows: [] };
    entry.rows.push(row);
    byUploader.set(row.uploaderId, entry);
  }

  // ...then one public profile read per artist, all at once.
  const artists = await Promise.all(
    [...byUploader].map(async ([uid, { rows }]): Promise<DirectoryArtist | null> => {
      let profile: PublicProfileView;
      try {
        const publicSnap = await getDoc(doc(db, "users", uid, "public", "data"));
        // No public profile (e.g. a deleted account): no page to link to, so not listed.
        if (!publicSnap.exists()) return null;
        profile = publicSnap.data() as PublicProfileView;
      } catch {
        return null;
      }
      const username = profile.username || (await confirmedUsername(uid, rows[0].uploaderUsername));
      if (!username) return null;
      return {
        ...profile,
        uid,
        username,
        displayName: profile.displayName || rows[0].uploaderDisplayName || username,
        bio: profile.bio ?? undefined,
        photoURL: profile.photoURL ?? undefined,
        stats: { ...profile.stats, uploadsCount: rows.length },
        modelCount: rows.length,
        latestUploadAt: toMillis(rows[0].createdAt),
        previews: [
          ...new Set(rows.map((r) => r.renderPrimaryUrl).filter((url): url is string => Boolean(url))),
        ].slice(0, 3),
      };
    }),
  );
  return artists.filter((a): a is DirectoryArtist => a !== null);
}

let cache: { at: number; promise: Promise<DirectoryArtist[]> } | null = null;

/** Every artist, built once and shared by the Artists page and both searches for 5 minutes. */
export function loadArtistDirectory(): Promise<DirectoryArtist[]> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.promise;
  const promise = buildDirectory();
  cache = { at: Date.now(), promise };
  promise.catch(() => {
    if (cache?.promise === promise) cache = null; // don't keep a failure
  });
  return promise;
}

/** For tests. */
export function clearArtistDirectoryCache() {
  cache = null;
}

export function filterArtists<T extends ArtistData>(artists: T[], term?: string): T[] {
  const needle = term?.trim().toLowerCase();
  if (!needle) return artists;
  return artists.filter(
    (a) =>
      a.username?.toLowerCase().includes(needle) ||
      a.displayName?.toLowerCase().includes(needle) ||
      a.bio?.toLowerCase().includes(needle),
  );
}

const byName = (a: DirectoryArtist, b: DirectoryArtist) =>
  (a.displayName || a.username).localeCompare(b.displayName || b.username, "en", { sensitivity: "base" });

export function sortArtists(artists: DirectoryArtist[], sort: ArtistSort): DirectoryArtist[] {
  const list = artists.slice();
  switch (sort) {
    case "recent":
      return list.sort((a, b) => b.latestUploadAt - a.latestUploadAt || byName(a, b));
    case "followers":
      return list.sort((a, b) => (b.stats?.followersCount ?? 0) - (a.stats?.followersCount ?? 0) || byName(a, b));
    case "name":
      return list.sort(byName);
    default:
      return list.sort((a, b) => b.modelCount - a.modelCount || b.latestUploadAt - a.latestUploadAt);
  }
}
