import { useState, type ReactNode } from "react";
import { SearchContext, SearchContextValue } from "../contexts/searchContext";

interface SearchProviderProps {
    children: ReactNode;
}

export const SearchProvider = ({ children }: SearchProviderProps) => {
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [activeTab, setActiveTab] = useState<string>("artworks");
    const [showDropdown, setShowDropdown] = useState<boolean>(false);

    const handleClearSearch = (): void => {
        setSearchTerm("");
        setActiveTab("artworks");
        setShowDropdown(false);
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }
    };

    const contextValue: SearchContextValue = {
        searchTerm,
        setSearchTerm,
        activeTab,
        setActiveTab,
        showDropdown,
        setShowDropdown,
        handleClearSearch,
    };

    return (
        <SearchContext.Provider value={contextValue}>{children}</SearchContext.Provider>
    );
};
