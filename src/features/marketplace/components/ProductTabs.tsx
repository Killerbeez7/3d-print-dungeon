import type { FC } from "react";

interface ProductTabsProps {
    tabs: string[];
    selected: string;
    onSelect: (tab: string) => void;
}

export const ProductTabs: FC<ProductTabsProps> = ({ tabs, selected, onSelect }) => (
    <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
            <button
                key={tab}
                className={`px-4 py-2 rounded-full font-medium shadow transition
                    ${selected === tab
                        ? "bg-[var(--accent)] text-white shadow-lg"
                        : "bg-[var(--bg-surface)] text-[var(--txt-primary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--accent)]"}
                `}
                onClick={() => onSelect(tab)}
            >
                {tab}
            </button>
        ))}
    </div>
);
