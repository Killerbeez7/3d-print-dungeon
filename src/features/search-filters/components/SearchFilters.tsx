import { useFilters } from "@/features/search-filters/hooks/useFilters";
import { CategoryFilter } from "./CategoryFilter";
import { AiToggleFilter } from "./AiToggleFilter";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchCategories } from "@/features/search-filters/services/categoryService";

export const SearchFilters = () => {
    const { filters, setFilters } = useFilters();
    const [searchParams] = useSearchParams();
    const query = searchParams.get("query") || "";
    
    // Fetch categories for selected categories display
    const { data: categories = [] } = useQuery({
        queryKey: ["categories"],
        queryFn: fetchCategories,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
    
    // Check if the sort dropdown should be disabled
    const hasActiveFilters = filters.categoryIds?.length || filters.hideAI;
    const shouldDisableSort = !query.trim() && !hasActiveFilters;

    const sortOptions = [
        { value: "relevance", label: "Sort by Relevance" },
        { value: "newest", label: "Sort by Newest" },
        { value: "popular", label: "Sort by Popular" },
        { value: "views", label: "Sort by Views" },
    ];

    const selectedCategories = categories.filter(cat => 
        filters.categoryIds?.includes(cat.id)
    );

    const removeCategory = (categoryId: string) => {
        const currentCategories = filters.categoryIds || [];
        const newCategories = currentCategories.filter(id => id !== categoryId);
        
        setFilters({
            ...filters,
            categoryIds: newCategories.length > 0 ? newCategories : undefined,
        });
    };

    const clearAllCategories = () => {
        setFilters({
            ...filters,
            categoryIds: undefined,
        });
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Top Container - Main Filter Controls */}
            <div className="flex flex-row items-center justify-between gap-4">
                {/* Left side filters */}
                <div className="flex flex-row items-center gap-4">
                    {/* Sort Dropdown */}
                    <div className="relative">
                        <select
                            className={`
                                px-4 py-2 rounded-lg border border-br-secondary
                                bg-bg-surface text-sm
                                focus:outline-none focus:ring-2 focus:ring-br-secondary focus:border-br-secondary
                                appearance-none pr-8
                                ${shouldDisableSort 
                                    ? 'text-txt-muted opacity-50' 
                                    : 'text-txt-primary cursor-pointer'
                                }
                            `}
                            value={filters.sortBy || "relevance"}
                            onChange={(e) =>
                                setFilters({ ...filters, sortBy: e.target.value })
                            }
                            disabled={shouldDisableSort}
                        >
                            {sortOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <div className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${
                            shouldDisableSort ? 'opacity-50' : ''
                        }`}>
                            <svg
                                className="w-4 h-4 text-txt-muted"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </div>
                    </div>

                    {/* Category Filter */}
                    <CategoryFilter />

                    {/* Add Filter Button */}
                    <button
                        className="
                            px-4 py-2 rounded-lg border border-br-secondary
                            bg-bg-surface text-txt-primary text-sm
                            hover:bg-bg-secondary transition-colors
                            flex items-center gap-2
                        "
                        onClick={() => {
                            // TODO: Implement add filter modal
                            console.log("Add filter clicked");
                        }}
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4v16m8-8H4"
                            />
                        </svg>
                        Add filter
                    </button>
                </div>

                {/* AI Toggle Filter - Far Right End */}
                <AiToggleFilter />
            </div>

            {/* Bottom Container - Selected Filters Display */}
            {selectedCategories.length > 0 && (
                <div className="flex flex-row items-center gap-4">
                    <span className="text-sm font-medium text-txt-primary">Categories Included:</span>
                    <div className="flex flex-wrap gap-2">
                        {selectedCategories.map((category) => (
                            <div
                                key={category.id}
                                className="flex items-center gap-2 px-3 py-2 bg-bg-secondary rounded-full border border-br-secondary"
                            >
                                <span className="text-sm text-txt-primary">{category.name}</span>
                                <button
                                    onClick={() => removeCategory(category.id)}
                                    className="text-txt-muted hover:text-txt-primary transition-colors"
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={clearAllCategories}
                        className="text-xs text-txt-muted hover:text-txt-primary transition-colors"
                    >
                        Clear all
                    </button>
                </div>
            )}
        </div>
    );
};
