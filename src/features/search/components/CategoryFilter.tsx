import { useState, useEffect, useRef } from "react";
import { useFilters } from "@/features/search/hooks/useFilters";
import { MODEL_CATEGORIES } from "@/features/models/constants/modelCategories";

export const CategoryFilter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { filters, setFilters } = useFilters();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleCategoryToggle = (categoryId: string) => {
    const currentCategories = filters.categoryIds ?? [];

    const newCategories = currentCategories.includes(categoryId)
      ? currentCategories.filter((id) => id !== categoryId)
      : [...currentCategories, categoryId];

    setFilters({
      ...filters,
      categoryIds: newCategories.length > 0 ? newCategories : undefined,
    });
  };

  const getDisplayText = () => {
    if (!filters.categoryIds?.length) {
      return "Categories";
    }

    if (filters.categoryIds.length === 1) {
      const category = MODEL_CATEGORIES.find(
        (category) => category.id === filters.categoryIds?.[0]
      );

      return category?.name ?? "Categories";
    }

    return `${filters.categoryIds.length} categories`;
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        className="
          flex min-w-[180px] cursor-pointer items-center justify-between
          rounded-lg border border-br-secondary bg-surface-card
          px-4 py-2 text-sm text-txt-primary
          focus:border-br-secondary focus:outline-none focus:ring-2 focus:ring-br-secondary
        "
        onClick={() => setIsOpen((current) => !current)}
      >
        <span className="truncate">{getDisplayText()}</span>

        <svg
          className={`h-4 w-4 text-txt-muted transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        // TODO: make the custom scrollbar responsive to theme change light/dark
        <div className="absolute left-0 top-full z-50 mt-1 max-h-80 w-80 overflow-y-auto rounded-lg border border-br-secondary bg-surface-card shadow-lg custom-scrollbar-md">
          <div className="p-3 ">
            {MODEL_CATEGORIES.map((category) => (
              <label
                key={category.id}
                className="flex cursor-pointer items-center rounded px-3 py-3 hover:bg-section"
              >
                <input
                  type="checkbox"
                  checked={filters.categoryIds?.includes(category.id) ?? false}
                  onChange={() => handleCategoryToggle(category.id)}
                  className="mr-3 h-4 w-4 rounded border-br-secondary text-accent focus:ring-accent"
                />

                <span className="text-sm text-txt-primary">{category.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
