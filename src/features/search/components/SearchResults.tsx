import { ArtworksTab } from "./ArtworksTab";
import { ArtistsTab } from "./ArtistsTab";

export const SearchResults = ({ 
    search, 
    activeTab,
    onResultsCount
}: { 
    search: string; 
    activeTab: "artworks" | "artists";
    onResultsCount?: (count: number) => void;
}) => {
    return (
        <>
            {activeTab === "artworks" ? (
                <ArtworksTab search={search} onResultsCount={onResultsCount} />
            ) : (
                <ArtistsTab search={search} />
            )}
        </>
    );
};
