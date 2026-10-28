import { FiltersProvider } from "@/features/search/providers/filtersProvider";
import { useFilters } from "@/features/search/hooks/useFilters";
import { SearchFilters } from "../components/SearchFilters";
import { SearchHeader } from "../components/SearchHeader";
import { SearchResults } from "../components/SearchResults";
import { SearchEmptyState } from "../components/SearchEmptyState";
import { useSearchPage } from "../hooks/useSearchPage";

const SearchPageContent = () => {
  const { localQuery, debouncedQuery, activeTab, handleInputChange, handleClear, handleTabSwitch } =
    useSearchPage();
  const { filters } = useFilters();

  const hasActiveFilters = Boolean(filters.categoryIds?.length || filters.hideAI);
  const shouldShowEmptyState = !debouncedQuery.trim() && !hasActiveFilters;

  return (
    <div className="min-h-screen bg-page pb-16">
      <SearchHeader
        value={localQuery}
        onChange={handleInputChange}
        onClear={handleClear}
        activeTab={activeTab}
        onTabSwitch={handleTabSwitch}
      />

      {/* Filters stay under the header while scrolling results */}
      <div className="sticky top-16 z-30 border-b border-br-subtle bg-page/85 backdrop-blur-xl">
        <div className="mx-auto max-w-[1600px] px-4 py-2.5 sm:px-6 lg:px-8">
          <SearchFilters />
        </div>
      </div>

      <div className="px-1">
        {shouldShowEmptyState ? (
          <SearchEmptyState />
        ) : (
          <SearchResults search={debouncedQuery} activeTab={activeTab} />
        )}
      </div>
    </div>
  );
};

export const SearchPage = () => (
  <FiltersProvider>
    <SearchPageContent />
  </FiltersProvider>
);
