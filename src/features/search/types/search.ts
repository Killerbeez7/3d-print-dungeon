import type { ModelData } from "@/features/models/types/model";
import type { ArtistData } from "@/features/artists/types/artists";


export interface SearchResultsProps {
    query: string;
    activeTab: "artworks" | "artists";
    artworks: ModelData[];
    artists: ArtistData[];
}