import type { ArtistData } from "@/features/artists/types/artists";
import { filterArtists, loadArtistDirectory, sortArtists } from "@/features/artists/services/artistDirectory";

/** Header search: the first few artists matching the term. */
export async function searchArtists(searchTerm: string, limitCount: number = 5): Promise<ArtistData[]> {
  if (!searchTerm.trim()) return [];
  try {
    return filterArtists(sortArtists(await loadArtistDirectory(), "models"), searchTerm).slice(0, limitCount);
  } catch (error) {
    console.error("Error searching artists:", error);
    return [];
  }
}

/** Search page, Artists tab: matching artists, the most active first. */
export async function fetchArtistsForSearch(searchTerm?: string, limitCount: number = 32): Promise<ArtistData[]> {
  try {
    return filterArtists(sortArtists(await loadArtistDirectory(), "models"), searchTerm).slice(0, limitCount);
  } catch (error) {
    console.error("Error fetching artists for search:", error);
    return [];
  }
}
