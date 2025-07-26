import { useArtists } from "@/features/search/hooks/useArtists";
import { ArtistListGrid } from "@/features/artists/components/ArtistListGrid";
import { Spinner } from "@/features/shared/reusable/Spinner";
import { SearchNotFound } from "@/features/search/components/SearchNotFound";

export const ArtistsTab = ({ search }: { search: string }) => {
    const { data = [], isLoading } = useArtists(search);

    if (!search.trim()) return null;
    if (isLoading) return <Spinner size={24} />;
    if (data.length === 0) return <SearchNotFound msg={"No artists found."} />;

    return <ArtistListGrid artists={data} />;
};
