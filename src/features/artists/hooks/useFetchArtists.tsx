import { useQuery } from "@tanstack/react-query";

import { loadArtistDirectory } from "../services/artistDirectory";

/** The full artist list; search and sort happen on the page, without new requests. */
export const useFetchArtists = () =>
  useQuery({
    queryKey: ["artists", "directory"],
    queryFn: loadArtistDirectory,
    staleTime: 5 * 60_000,
  });
