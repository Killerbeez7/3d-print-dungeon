import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const toggleArrayValue = (arr, value) =>
    arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];

export const ArtworksTab = ({ searchTerm, models }) => {
    const [sortBy, setSortBy] = useState("relevance");
    const [selectedMedia, setSelectedMedia] = useState([]);
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [hideAI, setHideAI] = useState(false);
    const [filteredModels, setFilteredModels] = useState([]);

    const sortOptions = [
        { value: "relevance", label: "Relevance" },
        { value: "likes", label: "Most Liked" },
        { value: "latest", label: "Newest" },
    ];
    const mediumOptions = [
        { value: "digital2d", label: "Digital 2D" },
        { value: "digital3d", label: "Digital 3D" },
        { value: "animation", label: "Animation" },
    ];
    const subjectOptions = [
        { value: "abstract", label: "Abstract" },
        { value: "anatomy", label: "Anatomy" },
        { value: "animals", label: "Animals & Wildlife" },
        { value: "props", label: "Props" },
    ];

    const applyAdvancedFilters = (list) => {
        let filtered = [...list];
        if (selectedMedia.length > 0) {
            filtered = filtered.filter((m) => selectedMedia.includes(m.medium));
        }
        if (selectedSubjects.length > 0) {
            filtered = filtered.filter((m) => {
                if (Array.isArray(m.subjects)) {
                    return m.subjects.some((sub) => selectedSubjects.includes(sub));
                }
                return selectedSubjects.includes(m.subject);
            });
        }
        if (hideAI) {
            filtered = filtered.filter((m) => !m.isAI);
        }
        switch (sortBy) {
            case "likes":
                filtered.sort((a, b) => (b.likes || 0) - (a.likes || 0));
                break;
            case "latest":
                filtered.sort(
                    (a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0)
                );
                break;
            default:
                break;
        }
        return filtered;
    };

    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredModels([]);
            return;
        }
        const matched = models.filter((m) =>
            m.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredModels(applyAdvancedFilters(matched));
    }, [searchTerm, models, sortBy, selectedMedia, selectedSubjects, hideAI]);

    return (
        <div className="max-w-6xl mx-auto">
            {/* Advanced Filters */}
            <div className="mb-6 p-4 bg-bg-surface rounded shadow border border-br-primary">
                <h3 className="text-xl font-semibold mb-3">Refine Your Search</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {/* Sort Field */}
                    <div>
                        <label className="block mb-1 text-sm font-medium text-txt-secondary">
                            Sort By
                        </label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full border border-br-primary rounded px-2 py-1 focus:outline-none focus:border-accent"
                        >
                            {sortOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    {/* Medium Multi-check */}
                    <div>
                        <label className="block mb-1 text-sm font-medium text-txt-secondary">
                            Medium
                        </label>
                        <div className="bg-bg-primary border border-br-primary rounded p-2 flex flex-wrap gap-2">
                            {mediumOptions.map((opt) => (
                                <label
                                    key={opt.value}
                                    className="flex items-center space-x-1 text-sm"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedMedia.includes(opt.value)}
                                        onChange={() =>
                                            setSelectedMedia((prev) =>
                                                toggleArrayValue(prev, opt.value)
                                            )
                                        }
                                    />
                                    <span>{opt.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    {/* Subject Multi-check */}
                    <div>
                        <label className="block mb-1 text-sm font-medium text-txt-secondary">
                            Subject Matter
                        </label>
                        <div className="bg-bg-primary border border-br-primary rounded p-2 flex flex-wrap gap-2">
                            {subjectOptions.map((opt) => (
                                <label
                                    key={opt.value}
                                    className="flex items-center space-x-1 text-sm"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedSubjects.includes(opt.value)}
                                        onChange={() =>
                                            setSelectedSubjects((prev) =>
                                                toggleArrayValue(prev, opt.value)
                                            )
                                        }
                                    />
                                    <span>{opt.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    {/* Hide AI Option */}
                    <div>
                        <label className="block mb-1 text-sm font-medium text-txt-secondary">
                            Quick Options
                        </label>
                        <label className="bg-bg-primary border border-br-primary rounded px-3 py-2 inline-flex items-center space-x-2 text-sm cursor-pointer">
                            <input
                                type="checkbox"
                                checked={hideAI}
                                onChange={() => setHideAI((prev) => !prev)}
                            />
                            <span>Hide AI-based</span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Display Results */}
            {filteredModels.length === 0 ? (
                <p className="text-sm text-txt-secondary">
                    {searchTerm.trim()
                        ? "No artworks found."
                        : "Start typing to search for artworks."}
                </p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredModels.map((m) => (
                        <Link
                            key={m.id}
                            to={`/model/${m.id}`}
                            className="border border-br-primary rounded-md overflow-hidden hover:shadow-md transition-shadow"
                        >
                            <img
                                src={m.primaryRenderUrl || "/placeholder.jpg"}
                                alt={m.name}
                                className="w-full h-40 object-cover"
                                loading="lazy"
                            />
                            <div className="p-2">
                                <h3 className="font-medium">{m.name}</h3>
                                <p className="text-xs text-txt-secondary">
                                    {m.description?.slice(0, 60)}...
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};
