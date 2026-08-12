import { ArtworksTab } from "./ArtworksTab";
import { ArtistsTab } from "./ArtistsTab";

import type { SearchTab } from "../types/search";

interface SearchResultProps {
  search: string;
  activeTab: SearchTab;
  onResultsCount?: (count: number) => void;
}

export const SearchResults = ({
  search,
  activeTab,
  onResultsCount,
}: SearchResultProps) => {
  if (activeTab === "artists") {
    return <ArtistsTab search={search} />;
  }

  return (
    <>
      <ArtworksTab search={search} onResultsCount={onResultsCount} />
    </>
  );
};
