import { useContext } from "react";
import { SearchContext, SearchContextValue } from "../context/searchContext";

export const useSearch = (): SearchContextValue => {
    const context = useContext(SearchContext);
    if (context === undefined) {
        throw new Error("useSearch must be used within a SearchProvider");
    }
    return context;
}; 