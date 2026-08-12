import { ArtistListGrid } from "@/features/artists/components/ArtistListGrid";
import { Spinner } from "@/features/shared/reusable/Spinner";

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
    return (
      <div className="flex justify-center py-10">
        <Spinner size={24} />
      </div>
    );
  }

  if (artists.length === 0) {
    return <SearchNotFound msg={"No artists found."} />;
  }

  return <ArtistListGrid artists={artists} />;
};
