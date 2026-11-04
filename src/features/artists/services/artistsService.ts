import { filterArtists, loadArtistDirectory, type DirectoryArtist } from "./artistDirectory";

export interface FetchArtistsOptions {
  search?: string;
}

/** Every artist matching the search (all of them without one). */
export async function fetchArtists(opts: FetchArtistsOptions = {}): Promise<DirectoryArtist[]> {
  return filterArtists(await loadArtistDirectory(), opts.search);
}
