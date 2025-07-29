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

const PAGE_SIZE = 32;

export interface FetchArtistsOptions {
    cursor?: QueryDocumentSnapshot<DocumentData>;
    limit?: number;
    search?: string;
}


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
