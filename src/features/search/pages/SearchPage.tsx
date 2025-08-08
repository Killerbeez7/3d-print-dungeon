import { useState } from "react";
import { FiltersProvider } from "@/features/search-filters/providers/filtersProvider";
import { SearchResults } from "../components/SearchResults";
import { SearchInput } from "../components/SearchInput";
import { SearchTabs } from "../components/SearchTabs";
import { SearchEmptyState } from "../components/SearchEmptyState";
import { SearchFilters } from "@/features/search-filters/components/SearchFilters";
import { useSearchPage } from "../hooks/useSearchPage";
import { Spinner } from "@/features/shared/reusable/Spinner";
import { useFilters } from "@/features/search-filters/hooks/useFilters";

const SearchPageContent = () => {
    const {
        localQuery,
        debouncedQuery,
        activeTab,
        modelsLoading,
        handleInputChange,
        handleClear,
        handleTabSwitch,
    } = useSearchPage();

    const { filters } = useFilters();
    const [resultsCount, setResultsCount] = useState<number>(0);

    // Check if there are any active filters
    const hasActiveFilters =
        filters.categoryIds?.length || filters.hideAI || filters.sortBy;

    // Show the prompt when there's no search query AND no active filters
    const shouldShowEmptyState = !debouncedQuery.trim() && !hasActiveFilters;

    return (
        <div className="min-h-screen text-txt-primary">
            {/* Search Input and Tabs Section with gray background */}
            <div className="bg-bg-secondary py-12 px-6 pb-0">
                {/* Large Search Input */}
                <div className="">
                    <SearchInput
                        value={localQuery}
                        onChange={handleInputChange}
                        onClear={handleClear}
                    />
                </div>

                {/* Tabs with layout handling */}
                <div className="flex justify-center">
                    <SearchTabs activeTab={activeTab} onTabSwitch={handleTabSwitch} />
                </div>
            </div>

            {/* Filters and Results Section */}
            <div className="p-6">
                {/* Filters */}
                <div className="mb-14">
                    <SearchFilters />
                </div>

                {/* Results */}
                {shouldShowEmptyState ? (
                    <SearchEmptyState />
                ) : modelsLoading ? (
                    <div className="flex justify-center py-10">
                        <Spinner size={24} />
                    </div>
                ) : (
                    <>
                        {/* Results Count */}
                        <div className="mb-4">
                            <span className="text-sm text-txt-muted">
                                {resultsCount.toLocaleString()} results found
                            </span>
                        </div>
                        <SearchResults
                            search={debouncedQuery}
                            activeTab={activeTab as "artworks" | "artists"}
                            onResultsCount={setResultsCount}
                        />
                    </>
                )}
            </div>
        </div>
    );
};

export const SearchPage = () => {
    return (
        <FiltersProvider>
            <SearchPageContent />
        </FiltersProvider>
    );
};
