import { useState, useEffect } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";
import { getThumbnailUrl } from "@/utils/imageUtils";
import { LazyImage } from "@/features/shared/reusable/LazyImage";
import type { UploadedArtwork, SortOption } from "../../types/profile";

interface UploadsTabProps {
    userId: string;
}

export const UploadsTab = ({ userId }: UploadsTabProps) => {
    const [artworks, setArtworks] = useState<UploadedArtwork[]>([]);
    const [filteredArtworks, setFilteredArtworks] = useState<UploadedArtwork[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [sortBy, setSortBy] = useState<SortOption>("newest");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

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
        const fetchUploads = async () => {
            if (!userId) return;

            try {
                setLoading(true);
                const modelsRef = collection(db, "models");
                const uploadsQuery = query(
                    modelsRef, 
                    where("uploaderId", "==", userId),
                    orderBy("createdAt", "desc")
                );
                const querySnapshot = await getDocs(uploadsQuery);

                const uploads: UploadedArtwork[] = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                    createdAt: doc.data().createdAt?.toDate() || new Date(),
                }));

                setArtworks(uploads);
                setFilteredArtworks(uploads);
            } catch (error) {
                console.error("Error fetching uploads:", error);
                setArtworks([]);
                setFilteredArtworks([]);
            } finally {
                setLoading(false);
            }
        };

        fetchUploads();
    }, [userId]);

    useEffect(() => {
        let filtered = [...artworks];

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(art => 
                art.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                art.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                art.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        // Apply category filter
        if (selectedCategory !== "all") {
            filtered = filtered.filter(art => art.category === selectedCategory);
        }

        // Apply sorting
        filtered.sort((a, b) => {
            switch (sortBy) {
                case "newest":
                    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
                case "oldest":
                    return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
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
    }, [artworks, searchTerm, selectedCategory, sortBy]);

    const handleArtworkClick = (artworkId: string) => {
        // Navigate to artwork detail page
        window.open(`/models/${artworkId}`, "_blank");
    };

    if (loading) {
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
                        {filteredArtworks.length} of {artworks.length} models
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
                    {filteredArtworks.map((art) => (
                        <article
                            key={art.id}
                            onClick={() => handleArtworkClick(art.id)}
                            className={`bg-bg-secondary border border-br-primary rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer ${
                                viewMode === "list" ? "flex" : ""
                            }`}
                        >
                            <div className={viewMode === "list" ? "w-32 h-32 flex-shrink-0" : "relative"}>
                                <LazyImage
                                    src={
                                        getThumbnailUrl(
                                            art.renderPrimaryUrl ?? null,
                                            "MEDIUM"
                                        ) || "/default-image.jpg"
                                    }
                                    alt={art.name || "Untitled"}
                                    className="w-full h-full object-cover"
                                />
                                {art.category && (
                                    <div className="absolute top-2 left-2">
                                        <span className="px-2 py-1 bg-black bg-opacity-75 text-white text-xs rounded-full">
                                            {art.category}
                                        </span>
                                    </div>
                                )}
                            </div>
                            
                            <div className={`p-4 ${viewMode === "list" ? "flex-1" : ""}`}>
                                <h3 className="font-semibold text-txt-primary mb-2 line-clamp-2">
                                    {art.name || "Untitled"}
                                </h3>
                                
                                {art.description && viewMode === "list" && (
                                    <p className="text-sm text-txt-secondary mb-3 line-clamp-2">
                                        {art.description}
                                    </p>
                                )}
                                
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-4">
                                        <span className="text-txt-secondary flex items-center gap-1">
                                            <i className="fas fa-heart text-error"></i>
                                            {art.likes || 0}
                                        </span>
                                        <span className="text-txt-secondary flex items-center gap-1">
                                            <i className="fas fa-eye text-txt-highlight"></i>
                                            {art.views || 0}
                                        </span>
                                    </div>
                                    
                                    {art.createdAt && (
                                        <span className="text-xs text-txt-secondary">
                                            {new Date(art.createdAt).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                                
                                {art.tags && art.tags.length > 0 && viewMode === "list" && (
                                    <div className="flex flex-wrap gap-1 mt-3">
                                        {art.tags.slice(0, 3).map((tag, index) => (
                                            <span
                                                key={index}
                                                className="px-2 py-1 bg-accent bg-opacity-20 text-accent text-xs rounded-full"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                        {art.tags.length > 3 && (
                                            <span className="px-2 py-1 bg-bg-primary text-txt-secondary text-xs rounded-full">
                                                +{art.tags.length - 3}
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
