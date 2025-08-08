import { useFilters } from "@/features/search-filters/hooks/useFilters";

export const AiToggleFilter = () => {
  const { filters, setFilters } = useFilters();
  return (
    <label className="inline-flex items-center space-x-2 cursor-pointer select-none px-4 text-txt-primary text-sm">
      <input
        type="checkbox"
        className="accent-br-secondary h-4 w-4"
        checked={filters.hideAI ?? false}
        onChange={(e) =>
          setFilters({ ...filters, hideAI: e.target.checked ? true : undefined })
        }
      />
      <span className="text-txt-primary">Hide AI-generated</span>
    </label>
  );
}; 