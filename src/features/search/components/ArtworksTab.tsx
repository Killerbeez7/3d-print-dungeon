import { useState, useEffect } from "react";
import { useArtworks } from "@/features/search/hooks/useArtworks";
import { HomeModelsGrid } from "@/features/home/components/HomeModelsGrid";
import { Spinner } from "@/features/shared/reusable/Spinner";
import { useFilters } from "@/features/search-filters/hooks/useFilters";
import { SearchNotFound } from "./SearchNotFound";

export const ArtworksTab = ({ 
    search, 
    onResultsCount 
}: { 
    search: string;
    onResultsCount?: (count: number) => void;
}) => {
    const { filters } = useFilters();
    const { data, isLoading, error } = useArtworks(filters, search);
    const [loadIndex, setLoadIndex] = useState<number>(0);

    const models = data?.pages.flatMap((p) => p.models) ?? [];

    // Update results count when models change
    useEffect(() => {
        if (onResultsCount && !isLoading) {
            onResultsCount(models.length);
        }
    }, [models.length, isLoading, onResultsCount]);

    const showSpinner = () => {
        return (
            <div className="col-span-full flex justify-center py-10">
                <Spinner size={24} />
            </div>
        );
    };

    // Show error state
    if (error) return <p>Error loading artworks: {error.message}</p>;

    // Show no results message only when not loading and no models
    if (!isLoading && models.length === 0) {
        const hasFilters =
            filters.categoryIds?.length || filters.hideAI || filters.sortBy;
        const message = search.trim()
            ? `No artworks found for "${search}".`
            : hasFilters
            ? "No artworks found with the selected filters."
            : "No artworks available.";
        return <SearchNotFound msg={message} />;
    }

    const handleBumpIndex = () => {
        setLoadIndex((prev) => prev + 1);
    };

    return (
        <>
            {isLoading ? (
                showSpinner()
            ) : (
                <HomeModelsGrid
                    models={models}
                    loadIndex={loadIndex}
                    bumpIndex={handleBumpIndex}
                />
            )}
        </>
    );
};
