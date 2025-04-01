import React, { createContext, useContext, useState } from "react";

const SearchContext = createContext();

export const useSearch = () => useContext(SearchContext);

export const SearchProvider = ({ children }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("artworks");
    const [showDropdown, setShowDropdown] = useState(false);

    const handleClearSearch = () => {
        setSearchTerm("");
        setActiveTab("artworks");
        setShowDropdown(false);
        document.activeElement.blur();
    };

    return (
        <SearchContext.Provider
            value={{
                searchTerm,
                setSearchTerm,
                activeTab,
                setActiveTab,
                showDropdown,
                setShowDropdown,
                handleClearSearch,
            }}
        >
            {children}
        </SearchContext.Provider>
    );
};
