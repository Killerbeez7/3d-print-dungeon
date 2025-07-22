import {
    collection,
    query,
    where,
    orderBy,
    startAfter,
    startAt,
    endAt,
    limit as fsLimit,
    getDocs,
    type QueryDocumentSnapshot,
    type DocumentData,
} from "firebase/firestore";
import { db } from "@/config/firebaseConfig";
import type { ArtistData } from "../types/artists";

/** Default number of artists fetched per page when `limit` is not provided. */
const PAGE_SIZE = 32;

export interface FetchArtistsOptions {
    /** Cursor from the previous page. */
    cursor?: QueryDocumentSnapshot<DocumentData>;
    /** Number of documents to fetch for this page. Defaults to `PAGE_SIZE`. */
    limit?: number;
    /** Optional case-insensitive search against the artist's `searchableName` field. */
    search?: string;
}

/**
 * Fetch a paginated list of artists.
 *
 * The function mirrors the signature and behaviour of `fetchModels` in the models feature so
 * that it can be consumed easily with TanStack Query's `useInfiniteQuery`.
 */
export async function fetchArtists(
    opts: FetchArtistsOptions = {}
): Promise<{
    artists: ArtistData[];
    nextCursor?: QueryDocumentSnapshot<DocumentData>;
}> {
    const {
        cursor,
        limit: pageSize = PAGE_SIZE,
        search,
    } = opts;

    let q = query(
        collection(db, "users"),
        where("artist", "==", true),
        orderBy("searchableName")
    );

    if (search?.trim()) {
        const lower = search.toLowerCase();
        q = query(q, startAt(lower), endAt(`${lower}\uf8ff`));
    }

    // Pagination – apply cursor before limiting.
    if (cursor) {
        q = query(q, startAfter(cursor));
    }

    q = query(q, fsLimit(pageSize));

    const snap = await getDocs(q);

    const artists: ArtistData[] = snap.docs.map((doc) => {
        const data = doc.data() as ArtistData;
        return {
            ...data,
            id: doc.id,
            uid: data.uid ?? doc.id,
            email: data.email ?? null,
            displayName: data.displayName ?? null,
            photoURL: data.photoURL ?? null,
            bio: data.bio,
        };
    });

    return {
        artists,
        nextCursor:
            snap.docs.length === pageSize ? snap.docs[snap.docs.length - 1] : undefined,
    };
}
