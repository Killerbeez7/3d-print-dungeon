import { ArtworksTab } from "./ArtworksTab";
import { ArtistsTab } from "./ArtistsTab";

export const SearchResults = ({
    search,
    activeTab,
}: {
    search: string;
    activeTab: "artworks" | "artists";
}) => {
    return (
        <>
            {activeTab === "artworks" ? (
                <ArtworksTab search={search} />
            ) : (
                <ArtistsTab search={search} />
            )}
        </>
    );
};
