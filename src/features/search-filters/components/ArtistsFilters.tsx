export const ArtistsFilters = () => {
    const sortOptions = [
        { value: "followers", label: "Sort by Followers" },
        { value: "newest", label: "Sort by Newest" },
        { value: "popular", label: "Sort by Popular" },
        { value: "uploads", label: "Sort by Uploads" },
    ];

    const locationOptions = [
        { value: "", label: "All Locations" },
        { value: "us", label: "United States" },
        { value: "uk", label: "United Kingdom" },
        { value: "ca", label: "Canada" },
        { value: "au", label: "Australia" },
        { value: "de", label: "Germany" },
    ];

    const experienceOptions = [
        { value: "", label: "All Experience Levels" },
        { value: "beginner", label: "Beginner" },
        { value: "intermediate", label: "Intermediate" },
        { value: "expert", label: "Expert" },
        { value: "professional", label: "Professional" },
    ];

    return (
        <div className="space-y-6 h-[100px]">
            {/* Main Filter Bar */}
            <div className="flex flex-wrap items-center gap-4">
                {/* Sort Dropdown */}
                <div className="relative">
                    <select
                        className="
                            px-4 py-2 rounded-lg border border-br-secondary
                            bg-bg-surface text-txt-primary text-sm
                            focus:outline-none focus:ring-2 focus:ring-br-secondary focus:border-br-secondary
                            appearance-none pr-8 cursor-pointer
                        "
                        defaultValue="followers"
                    >
                        {sortOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg
                            className="w-4 h-4 text-txt-muted"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                            />
                        </svg>
                    </div>
                </div>

                {/* Location Filter */}
                <div className="relative">
                    <select
                        className="
                            px-4 py-2 rounded-lg border border-br-secondary
                            bg-bg-surface text-txt-primary text-sm
                            focus:outline-none focus:ring-2 focus:ring-br-secondary focus:border-br-secondary
                            appearance-none pr-8 cursor-pointer
                        "
                        defaultValue=""
                    >
                        {locationOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg
                            className="w-4 h-4 text-txt-muted"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                            />
                        </svg>
                    </div>
                </div>

                {/* Experience Level Filter */}
                <div className="relative">
                    <select
                        className="
                            px-4 py-2 rounded-lg border border-br-secondary
                            bg-bg-surface text-txt-primary text-sm
                            focus:outline-none focus:ring-2 focus:ring-br-secondary focus:border-br-secondary
                            appearance-none pr-8 cursor-pointer
                        "
                        defaultValue=""
                    >
                        {experienceOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg
                            className="w-4 h-4 text-txt-muted"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                            />
                        </svg>
                    </div>
                </div>

                {/* Add Filter Button */}
                <button
                    className="
                        px-4 py-2 rounded-lg border border-br-secondary
                        bg-bg-surface text-txt-primary text-sm
                        hover:bg-bg-secondary transition-colors
                        flex items-center gap-2
                    "
                    onClick={() => {
                        // TODO: Implement add filter modal
                        console.log("Add filter clicked");
                    }}
                >
                    <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                        />
                    </svg>
                    Add filter
                </button>
            </div>

            {/* Quick Filters Section */}
            <div className="space-y-4">
                <div className="space-y-3">
                    <label className="inline-flex items-center space-x-2 mr-4 cursor-pointer select-none">
                        <input type="checkbox" className="accent-br-secondary h-4 w-4" />
                        <span className="text-txt-secondary">Verified Artists Only</span>
                    </label>
                    <label className="inline-flex items-center space-x-2 cursor-pointer select-none">
                        <input type="checkbox" className="accent-br-secondary h-4 w-4" />
                        <span className="text-txt-secondary">
                            Available for Commissions
                        </span>
                    </label>
                </div>
            </div>
        </div>
    );
};
