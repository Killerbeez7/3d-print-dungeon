import type { SearchTab } from "../types/search";

interface SearchTabsProps {
  activeTab: SearchTab;
  onTabSwitch: (tab: SearchTab) => void;
}

export const SearchTabs = ({ activeTab, onTabSwitch }: SearchTabsProps) => {
  return (
    <div className="flex gap-8">
      <button
        type="button"
        onClick={() => onTabSwitch("artworks")}
        className={`
          border-b-2 px-1 py-4 text-lg font-medium transition-colors
          ${
            activeTab === "artworks"
              ? "border-accent text-accent"
              : "border-transparent text-txt-muted hover:border-br-secondary hover:text-txt-primary"
          }
        `}
      >
        Artworks
      </button>

      <button
        type="button"
        onClick={() => onTabSwitch("artists")}
        className={`
          border-b-2 px-1 py-4 text-lg font-medium transition-colors
          ${
            activeTab === "artists"
              ? "border-accent text-accent"
              : "border-transparent text-txt-muted hover:border-br-secondary hover:text-txt-primary"
          }
        `}
      >
        Artists
      </button>
    </div>
  );
};
