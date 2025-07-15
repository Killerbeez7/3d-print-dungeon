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
    <div className="flex gap-2 mb-4 overflow-x-auto">
        {categories.map((cat) => (
            <button
                key={cat.id}
                className={`px-4 py-2 rounded ${
                    selected === cat.id
                        ? "bg-accent text-white"
                        : "bg-bg-surface text-txt-primary"
                }`}
                onClick={() => onSelect(cat.id)}
            >
                {cat.label}
            </button>
        ))}
    </div>
);
