import { FiltersProvider } from "@/features/search-filters/provider/filtersProvider";
import { SearchResults } from "../components/SearchResults";
import { SearchInput } from "../components/SearchInput";
import { SearchTabs } from "../components/SearchTabs";
import { SearchEmptyState } from "../components/SearchEmptyState";
import { useSearchPage } from "../hooks/useSearchPage";
import { Spinner } from "@/features/shared/reusable/Spinner";

export const SearchPage = () => {
    const {
        localQuery,
        debouncedQuery,
        activeTab,
        modelsLoading,
        noSearchNoFilters,
        handleInputChange,
        handleClear,
        handleTabSwitch,
    } = useSearchPage();

    return (
        <FiltersProvider>
            <div className="min-h-screen text-txt-primary p-6">
                <SearchInput
                    value={localQuery}
                    onChange={handleInputChange}
                    onClear={handleClear}
                />

                <SearchTabs activeTab={activeTab} onTabSwitch={handleTabSwitch} />

                {noSearchNoFilters ? (
                    <SearchEmptyState />
                ) : modelsLoading ? (
                    <Spinner size={24} />
                ) : (
                    <SearchResults
                        search={debouncedQuery}
                        activeTab={activeTab as "artworks" | "artists"}
                    />
                )}
            </div>
        </FiltersProvider>
    );
};
