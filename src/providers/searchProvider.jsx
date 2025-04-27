import { useState } from "react";
import PropTypes from "prop-types";
import { SearchContext } from "../contexts/searchContext";

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

SearchProvider.propTypes = {
    children: PropTypes.node.isRequired,
}; 