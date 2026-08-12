import { useQuery } from "@tanstack/react-query";

import type { ArtistData } from "@/features/artists/types/artists";
import { fetchArtistsForSearch } from "../services/searchService";

export const useArtists = (search: string) => {
  return useQuery({
    enabled: Boolean(search.trim()),
    queryKey: ["artists", search],
    queryFn: async (): Promise<ArtistData[]> => {
      return fetchArtistsForSearch(search, 32);
    },
  });
};
