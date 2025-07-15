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
    <div className="flex gap-2 mb-4 overflow-x-auto">
        {subcategories.map((sub) => (
            <button
                key={sub.id}
                className={`px-4 py-1 rounded-full text-sm border transition
                    ${selected === sub.id
                        ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                        : "bg-[var(--bg-secondary)] text-[var(--txt-primary)] border-[var(--bg-tertiary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--accent)]"}
                `}
                onClick={() => onSelect(sub.id)}
            >
                {sub.label}
            </button>
        ))}
    </div>
);
