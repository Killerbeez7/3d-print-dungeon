import { X } from "lucide-react";

import { MODEL_CATEGORIES } from "@/features/models/constants/modelCategories";

import { useFilters } from "../hooks/useFilters";
import { CategoryFilter } from "./CategoryFilter";
import { AiToggleFilter } from "./AiToggleFilter";

export const SearchFilters = () => {
  const { filters, setFilters } = useFilters();

  const selectedCategories = MODEL_CATEGORIES.filter((category) =>
    filters.categoryIds?.includes(category.id)
  );

  const removeCategory = (categoryId: string) => {
    const next = (filters.categoryIds ?? []).filter((id) => id !== categoryId);
    setFilters({ ...filters, categoryIds: next.length > 0 ? next : undefined });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <CategoryFilter />

      {selectedCategories.map((category) => (
        <button
          key={category.id}
          type="button"
          onClick={() => removeCategory(category.id)}
          aria-label={`Remove ${category.name} filter`}
          className="group inline-flex h-9 items-center gap-1.5 rounded-md bg-muted pl-3 pr-2 text-sm text-txt-primary transition-colors hover:bg-error/15"
        >
          {category.name}
          <X className="size-3.5 text-txt-muted group-hover:text-error" aria-hidden="true" />
        </button>
      ))}

      {selectedCategories.length > 1 && (
        <button
          type="button"
          onClick={() => setFilters({ ...filters, categoryIds: undefined })}
          className="h-9 px-2 text-sm text-txt-muted underline-offset-4 transition-colors hover:text-txt-primary hover:underline"
        >
          Clear all
        </button>
      )}

      <div className="ml-auto">
        <AiToggleFilter />
      </div>
    </div>
  );
};
