import { FiltersProvider } from "@/features/search-filters/providers/filtersProvider";
import { SearchResults } from "../components/SearchResults";
import { SearchInput } from "../components/SearchInput";
import { SearchTabs } from "../components/SearchTabs";
import { SearchEmptyState } from "../components/SearchEmptyState";
import { ArtistsFilters } from "@/features/search-filters/components/ArtistsFilters";
import { useArtistsSearchPage } from "../hooks/useArtistsSearchPage";

export const ArtistsSearchPage = () => {
  const {
    localQuery,
    debouncedQuery,
    activeTab,
    noSearchNoFilters,
    handleInputChange,
    handleClear,
    handleTabSwitch,
  } = useArtistsSearchPage();

  return (
    <FiltersProvider>
      <div className="min-h-screen text-txt-primary">
        <div className="bg-bg-secondary py-12 px-6 pb-0">
          <div className="">
            <SearchInput
              value={localQuery}
              onChange={handleInputChange}
              onClear={handleClear}
            />
          </div>

          {/* Tabs with layout handling */}
          <div className="flex justify-center">
            <SearchTabs activeTab={activeTab} onTabSwitch={handleTabSwitch} />
          </div>
        </div>

        {/* Filters and Results Section */}
        <div className="p-6">
          {/* Filters */}
          <div className="mb-8">
            <ArtistsFilters />
          </div>

          {/* Results */}
          {noSearchNoFilters ? (
            <SearchEmptyState />
          ) : (
            <SearchResults
              search={debouncedQuery}
              activeTab={activeTab as "artworks" | "artists"}
            />
          )}
        </div>
      </div>
    </FiltersProvider>
  );
};
