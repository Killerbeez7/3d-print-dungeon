import { createContext } from "react";

export const SearchContext = createContext({
    searchTerm: "",
    activeTab: "artworks",
    showDropdown: false,
    handleClearSearch: () => {},
}); 