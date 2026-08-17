import { useState } from "react";

import { FiltersProvider } from "@/features/search-filters/providers/filtersProvider";
import { SearchFilters } from "@/features/search-filters/components/SearchFilters";
import { useFilters } from "@/features/search-filters/hooks/useFilters";

import { SearchResults } from "../components/SearchResults";
import { SearchInput } from "../components/SearchInput";
import { SearchTabs } from "../components/SearchTabs";
import { SearchEmptyState } from "../components/SearchEmptyState";
import { useSearchPage } from "../hooks/useSearchPage";

const SearchPageContent = () => {
  const {
    localQuery,
    debouncedQuery,
    activeTab,
    handleInputChange,
    handleClear,
    handleTabSwitch,
  } = useSearchPage();

  const { filters } = useFilters();

  const [resultsCount, setResultsCount] = useState<number>(0);

  const hasActiveFilters = Boolean(
    filters.categoryIds?.length || filters.hideAI || filters.sortBy
  );

  const shouldShowEmptyState = !debouncedQuery.trim() && !hasActiveFilters;

  return (
    <div className="min-h-screen text-txt-primary">
      <div className="bg-section px-6 pb-0 py-12">
        <SearchInput
          value={localQuery}
          onChange={handleInputChange}
          onClear={handleClear}
        />

        <div className="flex justify-center">
          <SearchTabs activeTab={activeTab} onTabSwitch={handleTabSwitch} />
        </div>
      </div>

      <div className="p-6">
        <div className="mb-14">
          <SearchFilters />
        </div>

        {shouldShowEmptyState ? (
          <SearchEmptyState />
        ) : (
          <>
            <div className="mb-4">
              <span className="text-sm text-txt-muted">
                {resultsCount.toLocaleString()} results found
              </span>
            </div>

            <SearchResults
              search={debouncedQuery}
              activeTab={activeTab}
              onResultsCount={setResultsCount}
            />
          </>
        )}
      </div>
    </div>
  );
};

export const SearchPage = () => {
  return (
    <FiltersProvider>
      <SearchPageContent />
    </FiltersProvider>
  );
};
