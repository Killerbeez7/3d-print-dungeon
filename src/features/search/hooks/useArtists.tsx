import { useQuery } from "@tanstack/react-query";
import { fetchArtistsForSearch } from "@/features/search/services/searchService";
import type { ArtistData } from "@/features/artists/types/artists";

export const useArtists = (search: string) =>
    useQuery({
        enabled: !!search.trim(),
        queryKey: ["artists", search],
        queryFn: async (): Promise<ArtistData[]> => {
            return await fetchArtistsForSearch(search, 32);
        },
    });
