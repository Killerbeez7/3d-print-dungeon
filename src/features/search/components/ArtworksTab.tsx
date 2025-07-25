import { useState } from "react";
import { useArtworks } from "@/features/search/hooks/useArtworks";
import { HomeModelsGrid } from "@/features/home/components/HomeModelsGrid";
import { Spinner } from "@/features/shared/reusable/Spinner";
import { useFilters } from "@/features/search-filters/hooks/useFilters";

export const ArtworksTab = ({ search }: { search: string }) => {
    const { filters } = useFilters();
    const { data, isLoading, error } = useArtworks(filters, search);
    const [loadIndex, setLoadIndex] = useState<number>(0);

    console.log("ArtworksTab:", { search, filters, data, isLoading, error });

    if (!search.trim()) return null;
    if (isLoading) return <Spinner size={24} />;
    if (error) return <p>Error loading artworks: {error.message}</p>;

    const models = data?.pages.flatMap((p) => p.models) ?? [];
    console.log("Models found:", models.length);

    if (models.length === 0) return <p>No artworks found for &quot;{search}&quot;.</p>;

    const handleBumpIndex = () => {
        setLoadIndex(prev => prev + 1);
    };

    return <HomeModelsGrid models={models} loadIndex={loadIndex} bumpIndex={handleBumpIndex} />;
};
