import { useInfiniteQuery, InfiniteData } from "@tanstack/react-query";
import { fetchArtists, FetchArtistsOptions } from "../services/artistsService";
import type { ArtistData } from "../types/artists";
import type { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";

interface Page {
    artists: ArtistData[];
    nextCursor?: QueryDocumentSnapshot<DocumentData>;
}

export const useFetchArtists = (filters: FetchArtistsOptions) =>
    useInfiniteQuery<
        Page,
        Error,
        InfiniteData<Page>,
        [string, FetchArtistsOptions],
        QueryDocumentSnapshot<DocumentData> | undefined
    >({
        queryKey: ["artists", filters],
        queryFn: ({ pageParam }) => fetchArtists({ ...filters, cursor: pageParam }),
        getNextPageParam: (last) => last.nextCursor,
        initialPageParam: undefined,
        staleTime: 0,
    });
