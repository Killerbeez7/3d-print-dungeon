import { useState, useEffect, type ChangeEvent } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useSearch } from "./useSearch";
import { useModels } from "../../models/hooks/useModels";

export const useSearchPage = () => {
    const { activeTab, setActiveTab } = useSearch();
    const { loading: modelsLoading } = useModels();
    const navigate = useNavigate();
    
    // Local state for search input
    const [localQuery, setLocalQuery] = useState<string>("");
    const [debouncedQuery, setDebouncedQuery] = useState<string>("");
    const [searchParams, setSearchParams] = useSearchParams();
    
    // On mount, initialize local query from URL query parameter and set correct URL for artworks tab
    useEffect(() => {
        const queryFromURL = searchParams.get("query") || "";
        setLocalQuery(queryFromURL);
        
        // If we're on artworks tab and no sort_by parameter exists, add it
        if (activeTab === "artworks" && !searchParams.get("sort_by")) {
            setSearchParams({ sort_by: "relevance" });
        }
    }, [searchParams, activeTab, setSearchParams]);

    // Debounce local query update and update the URL
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(localQuery);
            
            // Preserve sort_by parameter when updating query
            const currentSortBy = searchParams.get("sort_by");
            if (currentSortBy) {
                if (localQuery.trim()) {
                    setSearchParams({ sort_by: currentSortBy, query: localQuery });
                } else {
                    setSearchParams({ sort_by: currentSortBy });
                }
            } else {
                if (localQuery.trim()) {
                    setSearchParams({ query: localQuery });
                } else {
                    setSearchParams({});
                }
            }
        }, 300);
        return () => clearTimeout(handler);
    }, [localQuery, setSearchParams, searchParams]);

    // Show the prompt when the query is empty
    const noSearchNoFilters = !debouncedQuery.trim();

    // Handle input change
    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setLocalQuery(e.target.value);
    };

    // Clear search input
    const handleClear = () => {
        setLocalQuery("");
    };

    // Switch active tabs and clear search
    const handleTabSwitch = (tab: string) => {
        setActiveTab(tab);
        setLocalQuery("");
        setDebouncedQuery("");
        
        // Navigate to the appropriate route
        if (tab === "artworks") {
            navigate("/search?sort_by=relevance");
        } else {
            navigate("/search/artists?sort_by=followers");
        }
    };

    return {
        localQuery,
        debouncedQuery,
        activeTab,
        modelsLoading,
        noSearchNoFilters,
        handleInputChange,
        handleClear,
        handleTabSwitch,
    };
};
