import { buttonClassName } from "@/components";
import { MODEL_CATEGORIES } from "@/features/models/constants/modelCategories";

interface CategoryChipsProps {
  selectedId: string | null;
  onSelect: (categoryId: string | null) => void;
}

// Ghost buttons; the selected one gets the quiet tinted look from `.chip` (styles.css).
const chipClass = (isSelected: boolean) =>
  buttonClassName({
    variant: "ghost",
    size: "sm",
    className: `chip h-7 shrink-0 px-2.5 text-[13px] [--cut:4px] ${isSelected ? "" : "text-txt-secondary"}`,
  });

/** One sideways-scrolling row of category filters. */
export const CategoryChips = ({ selectedId, onSelect }: CategoryChipsProps) => {
  return (
    <div
      role="group"
      aria-label="Filter by category"
      className="flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
