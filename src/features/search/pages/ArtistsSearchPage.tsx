import { FiltersProvider } from "@/features/search-filters/providers/filtersProvider";
import { ArtistsFilters } from "@/features/search-filters/components/ArtistsFilters";

import { SearchResults } from "../components/SearchResults";
import { SearchInput } from "../components/SearchInput";
import { SearchTabs } from "../components/SearchTabs";
import { SearchEmptyState } from "../components/SearchEmptyState";
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
          <div className="mb-8">
            <ArtistsFilters />
          </div>

          {noSearchNoFilters ? (
            <SearchEmptyState />
          ) : (
            <SearchResults search={debouncedQuery} activeTab={activeTab} />
          )}
        </div>
      </div>
    </FiltersProvider>
  );
};
