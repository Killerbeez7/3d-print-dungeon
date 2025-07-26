interface SearchTabsProps {
    activeTab: string;
    onTabSwitch: (tab: string) => void;
}

export const SearchTabs = ({ activeTab, onTabSwitch }: SearchTabsProps) => {
    return (
        <div className="flex space-x-8">
            <button
                onClick={() => onTabSwitch("artworks")}
                className={`
                    py-4 px-1 text-center border-b-2 font-medium text-lg transition-colors
                    ${
                        activeTab === "artworks"
                            ? "border-accent text-accent border-b-3"
                            : "border-transparent text-txt-muted hover:text-txt-primary hover:border-br-secondary"
                    }
                `}
            >
                Artworks
            </button>
            <button
                onClick={() => onTabSwitch("artists")}
                className={`
                    py-4 px-1 text-center border-b-2 font-medium text-lg transition-colors
                    ${
                        activeTab === "artists"
                            ? "border-accent text-accent border-b-3"
                            : "border-transparent text-txt-muted hover:text-txt-primary hover:border-br-secondary"
                    }
                `}
            >
                Artists
            </button>
        </div>
    );
};
