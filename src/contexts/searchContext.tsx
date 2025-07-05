import { createContext } from "react";

export interface SearchContextValue {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    activeTab: string;
    setActiveTab: (tab: string) => void;
    showDropdown: boolean;
    setShowDropdown: (show: boolean) => void;
    handleClearSearch: () => void;
}

export const SearchContext = createContext<SearchContextValue>({
    searchTerm: "",
    setSearchTerm: () => {},
    activeTab: "artworks",
    setActiveTab: () => {},
    showDropdown: false,
    setShowDropdown: () => {},
    handleClearSearch: () => {},
}); 