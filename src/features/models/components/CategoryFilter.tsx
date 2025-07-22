import { useQuery } from "@tanstack/react-query";
import { fetchCategories } from "@/features/models/services/categoryService";
import { useProductFilters } from "@/features/models/filterContext";

export const CategoryFilter = () => {
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const { filters, setFilters } = useProductFilters();

  return (
    <select
      className="
        mb-4 px-3 py-2 rounded
        bg-bg-surface text-txt-primary
        focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
        dark:bg-bg-surface-dark
      "
      value={filters.categoryIds?.[0] ?? ""}
      onChange={(e) =>
        setFilters({ ...filters, categoryIds: e.target.value ? [e.target.value] : undefined })
      }
    >
      <option value="">All categories</option>
      {categories.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name}
        </option>
      ))}
    </select>
  );
}; 