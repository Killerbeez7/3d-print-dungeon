import { UsersRound } from "lucide-react";

import { StatePanel } from "@/features/shared/components/StatePanel";
import { SearchHeader } from "../components/SearchHeader";
import { SearchResults } from "../components/SearchResults";
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
    <div className="min-h-screen bg-page pb-16">
      <SearchHeader
        value={localQuery}
        onChange={handleInputChange}
        onClear={handleClear}
        activeTab={activeTab}
        onTabSwitch={handleTabSwitch}
      />

      <div className="mx-auto max-w-[1600px] px-4 pt-6 sm:px-6 lg:px-8">
        {noSearchNoFilters ? (
          <StatePanel
            icon={UsersRound}
            headingLevel="h2"
            className="min-h-[50vh]"
            title="Find an artist"
          >
            Search by display name, username or bio.
          </StatePanel>
        ) : (
          <SearchResults search={debouncedQuery} activeTab={activeTab} />
        )}
      </div>
    </div>
  );
};
