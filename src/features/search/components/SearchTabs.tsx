interface SearchTabsProps {
    activeTab: string;
    onTabSwitch: (tab: string) => void;
}

export const SearchTabs = ({ activeTab, onTabSwitch }: SearchTabsProps) => {
    return (
        <div className="max-w-xl mx-auto flex space-x-4 mb-6">
            <button
                onClick={() => onTabSwitch("artworks")}
                className={`px-4 py-2 rounded font-medium transition-colors ${
                    activeTab === "artworks"
                        ? "bg-accent text-white"
                        : "bg-bg-surface text-txt-secondary hover:bg-accent-hover"
                }`}
            >
                Artworks
            </button>
            <button
                onClick={() => onTabSwitch("artists")}
                className={`px-4 py-2 rounded font-medium transition-colors ${
                    activeTab === "artists"
                        ? "bg-accent text-white"
                        : "bg-bg-surface text-txt-secondary hover:bg-accent-hover"
                }`}
            >
                Artists
            </button>
        </div>
    );
}; 