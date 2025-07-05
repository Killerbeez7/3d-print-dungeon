import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { LazyImage } from "../shared/lazy-image/LazyImage";
import { getThumbnailUrl, THUMBNAIL_SIZES } from "@/utils/imageUtils";
import type { Model, SortBy, Medium, Subject } from "@/types/search";

interface ArtworksTabProps {
    searchTerm: string;
    models: Model[];
}

const toggleArrayValue = (arr: string[], value: string): string[] =>
    arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];

export const ArtworksTab = ({ searchTerm, models }: ArtworksTabProps) => {
    const [sortBy, setSortBy] = useState<SortBy>("relevance");
    const [selectedMedia, setSelectedMedia] = useState<Medium[]>([]);
    const [selectedSubjects, setSelectedSubjects] = useState<Subject[]>([]);
    const [hideAI, setHideAI] = useState<boolean>(false);
    const [filteredModels, setFilteredModels] = useState<Model[]>([]);

    const sortOptions: { value: SortBy; label: string }[] = [
        { value: "relevance", label: "Relevance" },
        { value: "likes", label: "Most Liked" },
        { value: "latest", label: "Newest" },
    ];
    const mediumOptions: { value: Medium; label: string }[] = [
        { value: "2D", label: "2D" },
        { value: "3D", label: "3D" },
        { value: "miniatures", label: "Miniatures" },
    ];
    const subjectOptions: { value: Subject; label: string }[] = [
        { value: "abstract", label: "Abstract" },
        { value: "anatomy", label: "Anatomy" },
        { value: "animals", label: "Animals & Wildlife" },
        { value: "props", label: "Props" },
    ];

    const applyAdvancedFilters = (list: Model[]): Model[] => {
        let filtered = [...list];
        if (selectedMedia.length > 0) {
            filtered = filtered.filter((m) => m.medium && selectedMedia.includes(m.medium as Medium));
        }
        if (selectedSubjects.length > 0) {
            filtered = filtered.filter((m) => {
                if (Array.isArray(m.subjects)) {
                    return m.subjects.some((sub) => selectedSubjects.includes(sub as Subject));
                }
                return m.subject && selectedSubjects.includes(m.subject as Subject);
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
                    (a, b) => {
                        const aTime = typeof a.createdAt === "object" && "seconds" in a.createdAt ? a.createdAt.seconds : 0;
                        const bTime = typeof b.createdAt === "object" && "seconds" in b.createdAt ? b.createdAt.seconds : 0;
                        return bTime - aTime;
                    }
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
                            onChange={(e) => setSortBy(e.target.value as SortBy)}
                            className="w-full bg-bg-primary border border-br-primary rounded px-2 py-1 focus:outline-none focus:border-accent"
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
                                                toggleArrayValue(prev, opt.value) as Medium[]
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
                                                toggleArrayValue(prev, opt.value) as Subject[]
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
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2 sm:gap-3 md:gap-4">
                    {filteredModels.map((m) => (
                        <Link key={m.id} to={`/model/${m.id}`}>
                            <article className="relative bg-bg-surface rounded-md overflow-hidden shadow-sm hover:shadow-md transition-shadow w-full">
                                <div className="relative w-full aspect-square">
                                    <LazyImage
                                        src={getThumbnailUrl(
                                            m.renderPrimaryUrl,
                                            THUMBNAIL_SIZES.MEDIUM
                                        )}
                                        alt={m.name}
                                        className="absolute inset-0 w-full h-full object-cover rounded-lg"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0000006f] to-transparent flex items-end justify-start opacity-100 sm:opacity-0 sm:hover:opacity-100 transition-opacity">
                                        <div className="text-white p-2 sm:m-2">
                                            <h4 className="font-semibold text-sm sm:text-base truncate">
                                                {m.name}
                                            </h4>
                                            <p className="text-xs sm:text-sm truncate">
                                                {m.uploaderDisplayName}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};
