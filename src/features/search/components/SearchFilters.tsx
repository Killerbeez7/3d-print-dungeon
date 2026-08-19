import { useSearchParams } from "react-router-dom";

import { MODEL_CATEGORIES } from "@/features/models/constants/modelCategories";

import { useFilters } from "../hooks/useFilters";
import { CategoryFilter } from "./CategoryFilter";
import { AiToggleFilter } from "./AiToggleFilter";

const sortOptions = [
  { value: "relevance", label: "Sort by Relevance" },
  { value: "newest", label: "Sort by Newest" },
  { value: "popular", label: "Sort by Popular" },
  { value: "views", label: "Sort by Views" },
];

export const SearchFilters = () => {
  const { filters, setFilters } = useFilters();
  const [searchParams] = useSearchParams();

  const query = searchParams.get("query") ?? "";

  const hasActiveFilters = Boolean(filters.categoryIds?.length || filters.hideAI);

  const shouldDisableSort = !query.trim() && !hasActiveFilters;

  const selectedCategories = MODEL_CATEGORIES.filter((category) =>
    filters.categoryIds?.includes(category.id)
  );

  const handleCategoryRemove = (categoryId: string) => {
    const currentCategories = filters.categoryIds ?? [];

    const newCategories = currentCategories.filter((id) => id !== categoryId);

    setFilters({
      ...filters,
      categoryIds: newCategories.length > 0 ? newCategories : undefined,
    });
  };

  const handleClearCategories = () => {
    setFilters({
      ...filters,
      categoryIds: undefined,
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <select
              value={filters.sortBy ?? "relevance"}
              onChange={(event) =>
                setFilters({
                  ...filters,
                  sortBy: event.target.value,
                })
              }
              disabled={shouldDisableSort}
              className={`
                appearance-none rounded-lg border border-br-secondary
                bg-surface-card px-4 py-2 pr-8 text-sm
                focus:border-br-secondary focus:outline-none
                focus:ring-2 focus:ring-br-secondary
                ${
                  shouldDisableSort
                    ? "text-txt-muted opacity-50"
                    : "cursor-pointer text-txt-primary"
                }
              `}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <div
              className={`pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 ${
                shouldDisableSort ? "opacity-50" : ""
              }`}
            >
              <svg
                className="h-4 w-4 text-txt-muted"
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
            </div>
          </div>

          <CategoryFilter />

          <button
            type="button"
            className="
              flex items-center gap-2 rounded-lg
              border border-br-secondary bg-surface-card
              px-4 py-2 text-sm text-txt-primary
              transition-colors hover:bg-section
            "
            onClick={() => {
              // TODO: Implement additional filters.
              console.log("Add filter clicked");
            }}
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
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

        <AiToggleFilter />
      </div>

      {selectedCategories.length > 0 && (
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-txt-primary">
            Categories Included:
          </span>

          <div className="flex flex-wrap gap-2">
            {selectedCategories.map((category) => (
              <div
                key={category.id}
                className="
                  flex items-center gap-2 rounded-full
                  border border-br-secondary bg-section
                  px-3 py-2
                "
              >
                <span className="text-sm text-txt-primary">{category.name}</span>

                <button
                  type="button"
                  onClick={() => handleCategoryRemove(category.id)}
                  className="
                    text-txt-muted transition-colors
                    hover:text-txt-primary
                  "
                  aria-label={`Remove ${category.name} filter`}
                >
                  <svg
                    className="h-3 w-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleClearCategories}
            className="
              text-xs text-txt-muted transition-colors
              hover:text-txt-primary
            "
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
};
