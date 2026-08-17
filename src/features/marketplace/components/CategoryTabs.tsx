import type { FC } from "react";

interface CategoryTabsProps {
  categories: { id: string; label: string }[];
  selected: string;
  onSelect: (id: string) => void;
}

export const CategoryTabs: FC<CategoryTabsProps> = ({
  categories,
  selected,
  onSelect,
}) => (
  <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
    {categories.map((cat) => (
      <button
        type="button"
        key={cat.id}
        className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${
          selected === cat.id
            ? "border-accent bg-accent text-btn-primary-text shadow-sm shadow-accent/20"
            : "border-br-subtle bg-surface-card text-txt-secondary hover:border-accent/45 hover:text-txt-primary"
        }`}
        onClick={() => onSelect(cat.id)}
      >
        {cat.label}
      </button>
    ))}
  </div>
);
