import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { ArtworksTab } from "./ArtworksTab";
import { ArtistsTab } from "./ArtistsTab";
import { useSearch } from "../../contexts/searchContext";
import { useModels } from "../../contexts/modelsContext";

export function DynamicSearch() {
    const { activeTab, setActiveTab } = useSearch();
    const { models, loading: modelsLoading } = useModels();
    // Local state for dynamic search input, independent from the global search input.
    const [localQuery, setLocalQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [searchParams, setSearchParams] = useSearchParams();
    // On mount, initialize local query from URL query parameter.
    useEffect(() => {
        const queryFromURL = searchParams.get("query") || "";
        setLocalQuery(queryFromURL);
    }, [searchParams]);

    // Debounce local query update and update the URL (without affecting global state)
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(localQuery);
            setSearchParams({ query: localQuery });
        }, 300);
        return () => clearTimeout(handler);
    }, [localQuery, setSearchParams]);

    // Show the prompt when the query is empty.
    const noSearchNoFilters = !debouncedQuery.trim();

    // Only update the local state on input change.
    const handleInputChange = (e) => {
        setLocalQuery(e.target.value);
    };

    // Clear only the dynamic search input.
    const handleClear = () => {
        setLocalQuery("");
    };

    // Switch active tabs without affecting the query.
    const handleTabSwitch = (tab) => {
        setActiveTab(tab);
    };

    return (
        <div className="min-h-screen bg-bg-primary text-txt-primary p-6">
            {/* Dynamic Search input field */}
            <div className="max-w-xl mx-auto mb-4 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <FontAwesomeIcon icon={faSearch} />
                </span>
                <input
                    type="text"
                    placeholder="Search..."
                    value={localQuery}
                    onChange={handleInputChange}
                    className="w-full border border-br-primary rounded-full px-4 py-2 pl-10 pr-10 focus:outline-none focus:border-accent"
                />
                {localQuery && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                )}
            </div>
            {/* Tab buttons */}
            <div className="max-w-xl mx-auto flex space-x-4 mb-6">
                <button
                    onClick={() => handleTabSwitch("artworks")}
                    className={`px-4 py-2 rounded font-medium transition-colors ${
                        activeTab === "artworks"
                            ? "bg-accent text-white"
                            : "bg-bg-surface text-txt-secondary hover:bg-accent-hover"
                    }`}
                >
                    Artworks
                </button>
                <button
                    onClick={() => handleTabSwitch("artists")}
                    className={`px-4 py-2 rounded font-medium transition-colors ${
                        activeTab === "artists"
                            ? "bg-accent text-white"
                            : "bg-bg-surface text-txt-secondary hover:bg-accent-hover"
                    }`}
                >
                    Artists
                </button>
            </div>
            {/* Render search results */}
            {modelsLoading ? (
                <p className="text-sm text-txt-secondary mb-4">Loading...</p>
            ) : noSearchNoFilters ? (
                <div className="flex flex-col items-center justify-center text-center py-20">
                    <FontAwesomeIcon
                        icon={faSearch}
                        className="text-6xl text-gray-300 mb-4"
                    />
                    <h2 className="text-xl font-semibold text-txt-secondary mb-2">
                        What would you like to search for?
                    </h2>
                    <p className="text-sm text-txt-secondary max-w-sm">
                        Start your search with a keyword or add filtering options.
                    </p>
                </div>
            ) : activeTab === "artworks" ? (
                <ArtworksTab searchTerm={debouncedQuery} models={models} />
            ) : (
                <ArtistsTab searchTerm={debouncedQuery} />
            )}
        </div>
    );
}

export default DynamicSearch;
