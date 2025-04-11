import { createContext, useState, useContext } from "react";
import PropTypes from "prop-types";

const SearchContext = createContext();

export const useSearch = () => {
    const context = useContext(SearchContext);
    if (!context) {
        throw new Error("useSearch must be used within a SearchProvider");
    }
    return context;
};

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
