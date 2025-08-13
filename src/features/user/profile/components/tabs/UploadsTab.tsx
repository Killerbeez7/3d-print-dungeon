import { useState, useEffect } from "react";
import { getThumbnailUrl } from "@/utils/imageUtils";
import { LazyImage } from "@/features/shared/reusable/LazyImage";
import { useFetchUserModels } from "@/features/models/hooks/useFetchUserModels";
import type { SortOption } from "../../types/profile";
import type { ModelData } from "@/features/models/types/model";

interface UploadsTabProps {
    userId: string;
    userStats?: {
        uploadsCount: number;
    };
}

export const UploadsTab = ({ userId }: UploadsTabProps) => {
    const { models: userModels, isLoading: modelsLoading } = useFetchUserModels(userId);
    const [filteredArtworks, setFilteredArtworks] = useState<ModelData[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [sortBy, setSortBy] = useState<SortOption>("newest");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    // Helper function to convert Firestore timestamp to Date
    const getDateFromTimestamp = (timestamp: unknown): Date => {
        if (!timestamp) return new Date(0);
        if (typeof timestamp === 'object' && timestamp && 'toDate' in timestamp && typeof timestamp.toDate === 'function') {
            return timestamp.toDate();
        }
        if (typeof timestamp === 'object' && timestamp && 'seconds' in timestamp && typeof timestamp.seconds === 'number') {
            return new Date(timestamp.seconds * 1000);
        }
        return new Date(timestamp as string | number);
    };

    const categories = [
        { id: "all", name: "All Categories" },
        { id: "characters", name: "Characters" },
        { id: "environments", name: "Environments" },
        { id: "props", name: "Props" },
        { id: "vehicles", name: "Vehicles" },
        { id: "weapons", name: "Weapons" },
        { id: "animals", name: "Animals" },
        { id: "fantasy", name: "Fantasy" },
        { id: "sci-fi", name: "Sci-Fi" },
    ];

    const sortOptions = [
        { value: "newest", label: "Newest First", icon: "fas fa-clock" },
        { value: "oldest", label: "Oldest First", icon: "fas fa-history" },
        { value: "mostLiked", label: "Most Liked", icon: "fas fa-heart" },
        { value: "mostViewed", label: "Most Viewed", icon: "fas fa-eye" },
        { value: "name", label: "Name A-Z", icon: "fas fa-sort-alpha-down" },
    ];

    useEffect(() => {
        if (userModels.length > 0) {
            setFilteredArtworks(userModels);
        }
    }, [userModels]);

    useEffect(() => {
        let filtered = [...userModels];

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(model => 
                model.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                model.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                model.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        // Apply category filter
        if (selectedCategory !== "all") {
            filtered = filtered.filter(model => 
                model.categoryIds?.some(catId => catId === selectedCategory)
            );
        }

        // Apply sorting
        filtered.sort((a, b) => {
            switch (sortBy) {
                case "newest":
                    return getDateFromTimestamp(b.createdAt).getTime() - getDateFromTimestamp(a.createdAt).getTime();
                case "oldest":
                    return getDateFromTimestamp(a.createdAt).getTime() - getDateFromTimestamp(b.createdAt).getTime();
                case "mostLiked":
                    return (b.likes || 0) - (a.likes || 0);
                case "mostViewed":
                    return (b.views || 0) - (a.views || 0);
                case "name":
                    return (a.name || "").localeCompare(b.name || "");
                default:
                    return 0;
            }
        });

        setFilteredArtworks(filtered);
    }, [userModels, searchTerm, selectedCategory, sortBy]);

    const handleArtworkClick = (artworkId: string) => {
        // Navigate to artwork detail page
        window.open(`/models/${artworkId}`, "_blank");
    };

    if (modelsLoading) {
        return (
            <div className="text-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
                <p className="text-txt-secondary">Loading uploads...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with Stats */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-xl font-semibold text-txt-primary">Uploads</h3>
                    <p className="text-txt-secondary">
                        {filteredArtworks.length} of {userModels.length} models
                    </p>
                </div>
                
                {/* View Mode Toggle */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setViewMode("grid")}
                        className={`p-2 rounded-lg transition-colors ${
                            viewMode === "grid" 
                                ? "bg-accent text-white" 
                                : "bg-bg-secondary text-txt-secondary hover:text-txt-primary"
                        }`}
                        title="Grid View"
                    >
                        <i className="fas fa-th"></i>
                    </button>
                    <button
                        onClick={() => setViewMode("list")}
                        className={`p-2 rounded-lg transition-colors ${
                            viewMode === "list" 
                                ? "bg-accent text-white" 
                                : "bg-bg-secondary text-txt-secondary hover:text-txt-primary"
                        }`}
                        title="List View"
                    >
                        <i className="fas fa-list"></i>
                    </button>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-bg-secondary rounded-lg p-4 space-y-4">
                {/* Search */}
                <div className="relative">
                    <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-txt-secondary"></i>
                    <input
                        type="text"
                        placeholder="Search your uploads..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-bg-surface border border-br-primary rounded-lg text-txt-primary focus:border-accent focus:outline-none"
                    />
                </div>

                {/* Filters Row */}
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Category Filter */}
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-txt-secondary mb-2">Category</label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full px-3 py-2 bg-bg-surface border border-br-primary rounded-lg text-txt-primary focus:border-accent focus:outline-none"
                        >
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Sort Filter */}
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-txt-secondary mb-2">Sort By</label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as SortOption)}
                            className="w-full px-3 py-2 bg-bg-surface border border-br-primary rounded-lg text-txt-primary focus:border-accent focus:outline-none"
                        >
                            {sortOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Content */}
            {filteredArtworks.length === 0 ? (
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-upload text-2xl text-txt-secondary"></i>
                    </div>
                    <h4 className="text-lg font-semibold text-txt-primary mb-2">No Uploads Found</h4>
                    <p className="text-txt-secondary mb-6">
                        {searchTerm || selectedCategory !== "all" 
                            ? "Try adjusting your search or filters"
                            : "Start uploading your first model to see it here"
                        }
                    </p>
                    {!searchTerm && selectedCategory === "all" && (
                        <button className="cta-button px-6 py-3 rounded-lg">
                            <i className="fas fa-plus mr-2"></i>
                            Upload Model
                        </button>
                    )}
                </div>
            ) : (
                <div className={viewMode === "grid" 
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    : "space-y-4"
                }>
                    {filteredArtworks.map((model) => (
                        <article
                            key={model.id}
                            onClick={() => handleArtworkClick(model.id)}
                            className={`bg-bg-secondary border border-br-primary rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer ${
                                viewMode === "list" ? "flex" : ""
                            }`}
                        >
                            <div className={viewMode === "list" ? "w-32 h-32 flex-shrink-0" : "relative"}>
                                <LazyImage
                                    src={
                                        getThumbnailUrl(
                                            model.renderPrimaryUrl ?? null,
                                            "MEDIUM"
                                        ) || "/default-image.jpg"
                                    }
                                    alt={model.name || "Untitled"}
                                    className="w-full h-full object-cover"
                                />
                                {model.categoryIds && model.categoryIds.length > 0 && (
                                    <div className="absolute top-2 left-2">
                                        <span className="px-2 py-1 bg-black bg-opacity-75 text-white text-xs rounded-full">
                                            {model.categoryIds[0]}
                                        </span>
                                    </div>
                                )}
                            </div>
                            
                            <div className={`p-4 ${viewMode === "list" ? "flex-1" : ""}`}>
                                <h3 className="font-semibold text-txt-primary mb-2 line-clamp-2">
                                    {model.name || "Untitled"}
                                </h3>
                                
                                {model.description && viewMode === "list" && (
                                    <p className="text-sm text-txt-secondary mb-3 line-clamp-2">
                                        {model.description}
                                    </p>
                                )}
                                
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-4">
                                        <span className="text-txt-secondary flex items-center gap-1">
                                            <i className="fas fa-heart text-error"></i>
                                            {model.likes || 0}
                                        </span>
                                        <span className="text-txt-secondary flex items-center gap-1">
                                            <i className="fas fa-eye text-txt-highlight"></i>
                                            {model.views || 0}
                                        </span>
                                    </div>
                                    
                                    {model.createdAt && (
                                        <span className="text-xs text-txt-secondary">
                                            {getDateFromTimestamp(model.createdAt).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                                
                                {model.tags && model.tags.length > 0 && viewMode === "list" && (
                                    <div className="flex flex-wrap gap-1 mt-3">
                                        {model.tags.slice(0, 3).map((tag, index) => (
                                            <span
                                                key={index}
                                                className="px-2 py-1 bg-accent bg-opacity-20 text-accent text-xs rounded-full"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                        {model.tags.length > 3 && (
                                            <span className="px-2 py-1 bg-bg-primary text-txt-secondary text-xs rounded-full">
                                                +{model.tags.length - 3}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
};
