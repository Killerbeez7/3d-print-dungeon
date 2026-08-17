import { CategoryFilter } from "@/features/search-filters/components/CategoryFilter";
import { AiToggleFilter } from "@/features/search-filters/components/AiToggleFilter";
import { useFilters } from "@/features/search-filters/hooks/useFilters";

export const SearchFilters = () => {
  const { filters, setFilters } = useFilters();

  const hasActiveFilters = Boolean(filters.categoryIds?.length || filters.hideAI);

  const clearFilters = () => {
    setFilters({});
  };

  return (
    <div className="mx-auto max-w-xl rounded-lg border border-br-secondary bg-surface-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium text-txt-secondary">Filters</h3>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="flex min-h-[44px] items-center px-3 py-2 text-sm text-accent hover:text-accent-hover sm:text-base"
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
