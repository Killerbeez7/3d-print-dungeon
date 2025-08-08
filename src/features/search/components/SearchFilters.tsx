import { CategoryFilter } from "@/features/search-filters/components/CategoryFilter";
import { AiToggleFilter } from "@/features/search-filters/components/AiToggleFilter";
import { useFilters } from "@/features/search-filters/hooks/useFilters";

export const SearchFilters = () => {
    const { filters, setFilters } = useFilters();
    
    const hasActiveFilters = filters.categoryIds?.length || filters.hideAI;
    
    const clearFilters = () => {
        setFilters({});
    };

    return (
        <div className="max-w-xl mx-auto mb-6 p-4 bg-bg-surface rounded-lg border border-br-secondary">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-txt-secondary">Filters</h3>
                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="text-sm sm:text-base text-accent hover:text-accent-hover py-2 px-3 min-h-[44px] flex items-center"
                    >
                        Clear all
                    </button>
                )}
            </div>
            <div className="space-y-3">
                <CategoryFilter />
                <AiToggleFilter />
            </div>
        </div>
    );
}; 