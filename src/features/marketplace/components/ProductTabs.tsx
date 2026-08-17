import type { FC } from "react";

interface ProductTabsProps {
  tabs: string[];
  selected: string;
  onSelect: (tab: string) => void;
}

export const ProductTabs: FC<ProductTabsProps> = ({ tabs, selected, onSelect }) => (
  <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
    {tabs.map((tab) => (
      <button
        type="button"
        key={tab}
        className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus
                    ${
                      selected === tab
                        ? "border-accent bg-accent text-btn-primary-text shadow-sm shadow-accent/20"
                        : "border-br-subtle bg-surface-card text-txt-secondary hover:border-accent/40 hover:text-txt-primary"
                    }
                `}
        onClick={() => onSelect(tab)}
      >
        {tab}
      </button>
    ))}
  </div>
);
