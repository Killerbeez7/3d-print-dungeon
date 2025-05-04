import { createPortal } from "react-dom";

export const FilterPanel = ({
    isOpen,
    onClose,
    categoryFilter,
    setCategoryFilter,
    sortBy,
    setSortBy,
}) => {
    if (!isOpen) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-50"
            onClick={onClose}
            style={{ pointerEvents: "auto" }}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60" />

            {/* Panel */}
            <div
                onClick={(e) => e.stopPropagation()} // Prevent closing on panel clicks
                className="fixed left-5 bottom-20 w-80 bg-bg-surface text-txt-primary border border-br-primary rounded-lg shadow-xl">
                <div className="p-4">
                    <h2 className="text-lg font-bold">Filters</h2>

                    {/* Category Filter */}
                    <div className="mb-4">
                        <h3 className="text-base font-medium mb-2 text-txt-primary">
                            Categories
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {["all", "2D", "3D", "Concept", "Fantasy"].map(
                                (category) => (
                                    <button
                                        key={category}
                                        onClick={() =>
                                            setCategoryFilter(category)
                                        }
                                        className={`py-1.5 px-3 rounded-full text-sm font-medium transition-all ${
                                            categoryFilter === category
                                                ? "bg-accent text-white"
                                                : "bg-bg-hover hover:bg-accent-hover text-txt-secondary hover:text-white"
                                        }`}>
                                        {category}
                                    </button>
                                )
                            )}
                        </div>
                    </div>

                    {/* Sort Options */}
                    <div>
                        <h3 className="text-base font-medium mb-2 text-txt-primary">
                            Sort by
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { id: "community", label: "Community" },
                                { id: "popular", label: "Popular" },
                                { id: "latest", label: "Latest" },
                                { id: "views", label: "Most Viewed" },
                            ].map((option) => (
                                <button
                                    key={option.id}
                                    onClick={() => setSortBy(option.id)}
                                    className={`py-1.5 px-3 rounded-full text-sm font-medium transition-all ${
                                        sortBy === option.id
                                            ? "bg-accent text-white"
                                            : "bg-bg-hover hover:bg-accent-hover text-txt-secondary hover:text-white"
                                    }`}>
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};
