import type { FC } from "react";

interface SubcategoryBarProps {
  subcategories: { id: string; label: string }[];
  selected: string;
  onSelect: (id: string) => void;
}

export const SubcategoryBar: FC<SubcategoryBarProps> = ({
  subcategories,
  selected,
  onSelect,
}) => (
  <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
    {subcategories.map((sub) => (
      <button
        type="button"
        key={sub.id}
        className={`whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus
                    ${
                      selected === sub.id
                        ? "border-accent/45 bg-accent-soft text-accent-text"
                        : "border-br-subtle bg-section text-txt-secondary hover:border-accent/40 hover:text-txt-primary"
                    }
                `}
        onClick={() => onSelect(sub.id)}
      >
        {sub.label}
      </button>
    ))}
  </div>
);
