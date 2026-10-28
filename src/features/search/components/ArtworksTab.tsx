import { HomeModelsGrid, HomeModelsGridSkeleton } from "@/features/home/components/HomeModelsGrid";
import { InfiniteScrollList } from "@/features/shared/InfiniteScrollList";
import { Spinner } from "@/features/shared/reusable/Spinner";
import { useFilters } from "@/features/search/hooks/useFilters";

import { useArtworks } from "../hooks/useArtworks";
import { SearchNotFound } from "./SearchNotFound";

interface ArtworksTabProps {
  search: string;
}

export const ArtworksTab = ({ search }: ArtworksTabProps) => {
  const { filters } = useFilters();
  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useArtworks(filters, search);

  const models = data?.pages.flatMap((page) => page.models) ?? [];

  if (isLoading) {
    return <HomeModelsGridSkeleton />;
  }

  if (error) {
    return (
      <SearchNotFound
        msg="Search isn't working right now"
        hint="Check your connection and try again in a moment."
      />
    );
  }

  if (models.length === 0) {
    const hasActiveFilters = Boolean(filters.categoryIds?.length || filters.hideAI);

    return (
      <SearchNotFound
        msg={search.trim() ? `Nothing matches “${search.trim()}”` : "No models match these filters"}
        hint={
          hasActiveFilters
            ? "Try removing a filter or searching for something broader."
            : "Try fewer words or another spelling."
        }
      />
    );
  }

  return (
    <>
      <p className="label-mono px-3 pb-3 pt-4 text-txt-muted sm:px-5 lg:px-7" aria-live="polite">
        {models.length}
        {hasNextPage ? "+" : ""} {models.length === 1 ? "model" : "models"}
      </p>
      <InfiniteScrollList
        items={models}
        hasMore={Boolean(hasNextPage)}
        loadMore={fetchNextPage}
        isLoading={isFetchingNextPage}
        loader={
          <div className="flex justify-center py-10">
            <Spinner size={24} />
          </div>
        }
      >
        <HomeModelsGrid models={models} />
      </InfiniteScrollList>
    </>
  );
};
