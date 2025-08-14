import { fetchArtistsForSearch } from "@/features/search/services/searchService";
import type { ArtistData } from "../types/artists";
import type { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";

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
        limit: pageSize = PAGE_SIZE,
        search,
    } = opts;

    // Use the new search service that works with the new user schema
    const artists = await fetchArtistsForSearch(search, pageSize);

    return {
        artists,
        // Note: Pagination cursor is not implemented in the new service yet
        // This would need to be added if pagination is required
        nextCursor: undefined,
    };
}
