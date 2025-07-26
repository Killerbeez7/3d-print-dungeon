import { useFilters } from "@/features/search-filters/hooks/useFilters";
import { CategoryFilter } from "./CategoryFilter";
import { AiToggleFilter } from "./AiToggleFilter";

export const SearchFilters = () => {
    const { filters, setFilters } = useFilters();

    const sortOptions = [
        { value: "relevance", label: "Sort by Relevance" },
        { value: "newest", label: "Sort by Newest" },
        { value: "popular", label: "Sort by Popular" },
        { value: "views", label: "Sort by Views" },
    ];

    return (
        <div className="space-y-6 h-[100px]">
            {/* Main Filter Bar */}
            <div className="flex flex-wrap items-center gap-4">
                {/* Sort Dropdown */}
                <div className="relative">
                    <select
                        className="
                            px-4 py-2 rounded-lg border border-br-secondary
                            bg-bg-surface text-txt-primary text-sm
                            focus:outline-none focus:ring-2 focus:ring-br-secondary focus:border-br-secondary
                            appearance-none pr-8 cursor-pointer
                        "
                        value={filters.sortBy || "relevance"}
                        onChange={(e) =>
                            setFilters({ ...filters, sortBy: e.target.value })
                        }
                    >
                        {sortOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
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

            {/* Quick Filters Section */}
            <div className="space-y-4">
                <div className="space-y-3">
                    <AiToggleFilter />
                </div>
            </div>
        </div>
    );
};
