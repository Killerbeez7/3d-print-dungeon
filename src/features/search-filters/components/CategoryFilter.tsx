import { useQuery } from "@tanstack/react-query";
import { fetchCategories } from "@/features/search-filters/services/categoryService";
import { useFilters } from "@/features/search-filters/hooks/useFilters";

export const CategoryFilter = () => {
    const { data: categories = [], isLoading } = useQuery({
        queryKey: ["categories"],
        queryFn: fetchCategories,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
    const { filters, setFilters } = useFilters();

    return (
        <div className="relative">
            <select
                className="
                    px-4 py-2 rounded-lg border border-br-secondary
                    bg-bg-surface text-txt-primary text-sm
                    focus:outline-none focus:ring-2 focus:ring-br-secondary focus:border-br-secondary
                    appearance-none pr-8 cursor-pointer
                "
                value={filters.categoryIds?.[0] ?? ""}
                onChange={(e) =>
                    setFilters({
                        ...filters,
                        categoryIds: e.target.value ? [e.target.value] : undefined,
                    })
                }
                disabled={isLoading}
            >
                <option value="">Categories</option>
                {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                        {c.name}
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
    );
};
