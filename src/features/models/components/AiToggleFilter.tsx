import { useProductFilters } from "@/features/models/filterContext";

export const AiToggleFilter = () => {
  const { filters, setFilters } = useProductFilters();
  return (
    <label className="inline-flex items-center space-x-2 mb-4 cursor-pointer select-none">
      <input
        type="checkbox"
        className="accent-accent h-4 w-4"
        checked={filters.hideAI ?? false}
        onChange={(e) =>
          setFilters({ ...filters, hideAI: e.target.checked ? true : undefined })
        }
      />
      <span className="text-txt-secondary">Hide AI-generated</span>
    </label>
  );
}; 