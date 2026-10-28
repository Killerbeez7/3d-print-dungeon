import { ArtworksTab } from "./ArtworksTab";
import { ArtistsTab } from "./ArtistsTab";

import type { SearchTab } from "../types/search";

interface SearchResultProps {
  search: string;
  activeTab: SearchTab;
}

export const SearchResults = ({ search, activeTab }: SearchResultProps) =>
  activeTab === "artists" ? <ArtistsTab search={search} /> : <ArtworksTab search={search} />;
