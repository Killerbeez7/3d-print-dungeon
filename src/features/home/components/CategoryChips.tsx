import { MODEL_CATEGORIES } from "@/features/models/constants/modelCategories";

interface CategoryChipsProps {
  selectedId: string | null;
  onSelect: (categoryId: string | null) => void;
}

const chipClass = (isSelected: boolean) =>
  `inline-flex h-9 shrink-0 items-center rounded-full border px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${
    isSelected
      ? "border-transparent bg-btn-primary text-btn-primary-text"
      : "border-br-secondary bg-surface-card text-txt-secondary hover:border-br-primary hover:text-txt-primary"
  }`;

export const CategoryChips = ({ selectedId, onSelect }: CategoryChipsProps) => {
  return (
    <div
      role="group"
      aria-label="Filter by category"
      className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden"
    >
      <button
        type="button"
        aria-pressed={selectedId === null}
        className={chipClass(selectedId === null)}
        onClick={() => onSelect(null)}
      >
        All
      </button>
      {MODEL_CATEGORIES.map((category) => (
        <button
          key={category.id}
          type="button"
          aria-pressed={selectedId === category.id}
          className={chipClass(selectedId === category.id)}
          onClick={() => onSelect(category.id)}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
};
