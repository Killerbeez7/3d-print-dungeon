import { useState, useEffect, useRef } from "react";
import { Check, ChevronDown } from "lucide-react";

import { useFilters } from "@/features/search/hooks/useFilters";
import { MODEL_CATEGORIES } from "@/features/models/constants/modelCategories";

export const CategoryFilter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { filters, setFilters } = useFilters();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selected = filters.categoryIds ?? [];

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const handleCategoryToggle = (categoryId: string) => {
    const next = selected.includes(categoryId)
      ? selected.filter((id) => id !== categoryId)
      : [...selected, categoryId];

    setFilters({ ...filters, categoryIds: next.length > 0 ? next : undefined });
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="true"
        onClick={() => setIsOpen((current) => !current)}
        className={`flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors ${
          selected.length > 0
            ? "border-accent bg-accent-soft text-txt-primary"
            : "border-br-secondary text-txt-secondary hover:border-br-primary hover:text-txt-primary"
        }`}
      >
        Categories
        {selected.length > 0 && (
          <span className="font-mono text-xs text-accent">{selected.length}</span>
        )}
        <ChevronDown
          className={`size-4 text-txt-muted transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-lg border border-br-secondary bg-surface-elevated shadow-popover">
          <fieldset className="custom-scrollbar-md max-h-80 overflow-y-auto p-1.5">
            <legend className="sr-only">Categories</legend>
            {MODEL_CATEGORIES.map((category) => {
              const isChecked = selected.includes(category.id);
              return (
                <label
                  key={category.id}
                  className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-sm text-txt-primary transition-colors hover:bg-muted has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-focus"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleCategoryToggle(category.id)}
                    className="peer sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className={`flex size-4 shrink-0 items-center justify-center rounded-sm border transition-colors ${
                      isChecked ? "border-btn-primary bg-btn-primary text-btn-primary-text" : "border-br-input"
                    }`}
                  >
                    {isChecked && <Check className="size-3" strokeWidth={3} />}
                  </span>
                  {category.name}
                </label>
              );
            })}
          </fieldset>
        </div>
      )}
    </div>
  );
};
