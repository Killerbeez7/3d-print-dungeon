import { useArtists } from "@/features/search/hooks/useArtists";
import { ArtistListGrid } from "@/features/artists/components/ArtistListGrid";
import { Spinner } from "@/features/shared/reusable/Spinner";

export const ArtistsTab = ({ search }: { search: string }) => {
  const { data = [], isLoading } = useArtists(search);

  if (!search.trim()) return null;
  if (isLoading) return <Spinner size={24} />;
  if (data.length === 0) return <p>No artists found.</p>;

  return <ArtistListGrid artists={data} />;
};