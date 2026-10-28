import type { SearchTab } from "../types/search";

interface SearchTabsProps {
  activeTab: SearchTab;
  onTabSwitch: (tab: SearchTab) => void;
}

const tabs: { id: SearchTab; label: string }[] = [
  { id: "artworks", label: "Models" },
  { id: "artists", label: "Artists" },
];

export const SearchTabs = ({ activeTab, onTabSwitch }: SearchTabsProps) => {
  return (
    <div role="tablist" aria-label="Search in" className="flex gap-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          onClick={() => onTabSwitch(tab.id)}
          className={`relative flex h-12 items-center px-3 text-sm font-semibold transition-colors after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:origin-left after:bg-accent after:transition-transform after:duration-300 after:ease-forge ${
            activeTab === tab.id
              ? "text-txt-primary after:scale-x-100"
              : "text-txt-muted after:scale-x-0 hover:text-txt-primary"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};
