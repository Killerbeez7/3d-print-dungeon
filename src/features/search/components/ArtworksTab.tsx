import { useState, useEffect } from "react";

import { HomeModelsGrid } from "@/features/home/components/HomeModelsGrid";
import { Spinner } from "@/features/shared/reusable/Spinner";
import { useFilters } from "@/features/search-filters/hooks/useFilters";

import { useArtworks } from "../hooks/useArtworks";
import { SearchNotFound } from "./SearchNotFound";

interface ArtworksTabProps {
  search: string;
  onResultsCount?: (count: number) => void;
}

export const ArtworksTab = ({ search, onResultsCount }: ArtworksTabProps) => {
  const { filters } = useFilters();
  const { data, isLoading, error } = useArtworks(filters, search);

  const [loadIndex, setLoadIndex] = useState<number>(0);

  const models = data?.pages.flatMap((page) => page.models) ?? [];

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!onResultsCount) {
      return;
    }

    onResultsCount(models.length);
  }, [models.length, isLoading, onResultsCount]);

  const handleBumpIndex = () => {
    setLoadIndex((current) => current + 1);
  };

  if (isLoading) {
    return (
      <div className="col-span-full flex justify-center py-10">
        <Spinner size={24} />
      </div>
    );
  }

  if (error) {
    return <p>Error loading artworks: {error.message}</p>;
  }

  if (models.length === 0) {
    const hasActiveFilters = Boolean(filters.categoryIds?.length || filters.hideAI);

    const message = search.trim()
      ? `No artworks found for "${search}".`
      : hasActiveFilters
      ? "No artworks found with the selected filters."
      : "No artworks available.";

    return <SearchNotFound msg={message} />;
  }

  return (
    <HomeModelsGrid models={models} loadIndex={loadIndex} bumpIndex={handleBumpIndex} />
  );
};
