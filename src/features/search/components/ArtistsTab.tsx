import { ArtistListGrid } from "@/features/artists/components/ArtistListGrid";
import { ArtistListSkeleton } from "@/features/artists/components/ArtistListSkeleton";

import { useArtists } from "@/features/search/hooks/useArtists";
import { SearchNotFound } from "@/features/search/components/SearchNotFound";

interface ArtistsProps {
  search: string;
}

export const ArtistsTab = ({ search }: ArtistsProps) => {
  const { data: artists = [], isLoading } = useArtists(search);

  if (!search.trim()) {
    return null;
  }

  if (isLoading) {
    return <ArtistListSkeleton count={5} />;
  }

  if (artists.length === 0) {
    return <SearchNotFound msg={"No artists found."} />;
  }

  return <ArtistListGrid artists={artists} />;
};
