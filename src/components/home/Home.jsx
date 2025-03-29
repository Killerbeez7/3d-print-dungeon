import { useState } from "react";
import { useModels } from "../../contexts/modelsContext";
import { Link } from "react-router-dom";
import LazyImage from "../shared/lazy-image/LazyImage";
import { FeaturedCarousel } from "./FeaturedCarousel";

export const Home = () => {
    const { models, loading } = useModels();
    const [hasMore, setHasMore] = useState(true);
    const [sortBy, setSortBy] = useState("community");
    const [categoryFilter, setCategoryFilter] = useState("all");

    if (loading) {
        return <p className="p-4">Loading models...</p>;
    }

    const artworks = models.map((m) => ({
        id: m.id,
        title: m.name || "Untitled Model",
        artist: m.uploaderDisplayName || "Anonymous",
        tags: Array.isArray(m.tags) ? m.tags : ["3D"],
        imageUrl: m.primaryRenderLowResUrl || m.primaryRenderUrl || "/image.png",
        likes: m.likes || 0,
        views: m.views || 0,
        createdAt: m.createdAt,
    }));

    const sortedArtworks = applySorting(artworks, sortBy);
    const displayedArtworks = applyCategoryFilter(sortedArtworks, categoryFilter);

    const handleLoadMore = () => {
        setHasMore(false);
    };

    return (
        <div className="bg-bg-primary text-txt-primary min-h-screen">
            {/* Featured Carousel Section */}
            <FeaturedCarousel />

            <div className="mx-auto p-4">
                <h1 className="mb-4 font-bold">Models</h1>

                {/* Category Buttons */}
                <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-2">
                    <div className="flex items-center mb-3 md:mb-0 space-x-2">
                        <label
                            htmlFor="sortBy"
                            className="text-txt-secondary text-lg font-medium"
                        >
                            Filter by:
                        </label>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setCategoryFilter("all")}
                                className={`py-2 px-4 rounded-full text-sm font-medium transition-all ${
                                    categoryFilter === "all"
                                        ? "bg-accent text-white"
                                        : "bg-bg-surface hover:bg-accent-hover"
                                }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setCategoryFilter("2D")}
                                className={`py-2 px-4 rounded-full text-sm font-medium transition-all ${
                                    categoryFilter === "2D"
                                        ? "bg-accent text-white"
                                        : "bg-bg-surface hover:bg-accent-hover"
                                }`}
                            >
                                2D
                            </button>
                            <button
                                onClick={() => setCategoryFilter("3D")}
                                className={`py-2 px-4 rounded-full text-sm font-medium transition-all ${
                                    categoryFilter === "3D"
                                        ? "bg-accent text-white"
                                        : "bg-bg-surface hover:bg-accent-hover"
                                }`}
                            >
                                3D
                            </button>
                            <button
                                onClick={() => setCategoryFilter("Concept")}
                                className={`py-2 px-4 rounded-full text-sm font-medium transition-all ${
                                    categoryFilter === "Concept"
                                        ? "bg-accent text-white"
                                        : "bg-bg-surface hover:bg-accent-hover"
                                }`}
                            >
                                Concept
                            </button>
                            <button
                                onClick={() => setCategoryFilter("Fantasy")}
                                className={`py-2 px-4 rounded-full text-sm font-medium transition-all ${
                                    categoryFilter === "Fantasy"
                                        ? "bg-accent text-white"
                                        : "bg-bg-surface hover:bg-accent-hover"
                                }`}
                            >
                                Fantasy
                            </button>
                        </div>
                    </div>

                    {/* Sort Menu */}
                    <div className="flex items-center space-x-2">
                        <label
                            htmlFor="sortBy"
                            className="text-txt-secondary text-lg font-medium"
                        >
                            Sort by:
                        </label>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setSortBy("community")}
                                className={`py-2 px-4 rounded-full text-sm font-medium transition-all ${
                                    sortBy === "community"
                                        ? "bg-accent text-white"
                                        : "bg-bg-surface hover:bg-accent-hover"
                                }`}
                            >
                                Community
                            </button>
                            <button
                                onClick={() => setSortBy("popular")}
                                className={`py-2 px-4 rounded-full text-sm font-medium transition-all ${
                                    sortBy === "popular"
                                        ? "bg-accent text-white"
                                        : "bg-bg-surface hover:bg-accent-hover"
                                }`}
                            >
                                Popular
                            </button>
                            <button
                                onClick={() => setSortBy("latest")}
                                className={`py-2 px-4 rounded-full text-sm font-medium transition-all ${
                                    sortBy === "latest"
                                        ? "bg-accent text-white"
                                        : "bg-bg-surface hover:bg-accent-hover"
                                }`}
                            >
                                Latest
                            </button>
                            <button
                                onClick={() => setSortBy("views")}
                                className={`py-2 px-4 rounded-full text-sm font-medium transition-all ${
                                    sortBy === "views"
                                        ? "bg-accent text-white"
                                        : "bg-bg-surface hover:bg-accent-hover"
                                }`}
                            >
                                Most Viewed
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Gallery Grid */}
            <div className="mx-auto px-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2">
                    {displayedArtworks.map((art) => (
                        <Link key={art.id} to={`/model/${art.id}`}>
                            <article className="relative bg-bg-surface rounded-md overflow-hidden shadow-sm hover:shadow-md transition-shadow w-full">
                                <div className="relative w-full aspect-square">
                                    <LazyImage
                                        src={art.imageUrl}
                                        alt={art.title}
                                        className="absolute inset-0 w-full h-full object-cover rounded-lg"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0000006f] to-transparent flex items-end justify-start opacity-0 hover:opacity-100 transition-opacity">
                                        <div className="text-white m-2">
                                            <h4 className="font-semibold">{art.title}</h4>
                                            <p className="text-sm">{art.artist}</p>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        </Link>
                    ))}
                </div>

                {hasMore && (
                    <div className="text-center mt-8">
                        <button
                            onClick={handleLoadMore}
                            className="bg-accent text-white py-2 px-6 rounded-full font-medium hover:bg-accent-hover transition-colors"
                        >
                            Load More
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

function applySorting(artworks, sortBy) {
    switch (sortBy) {
        case "popular":
            return [...artworks].sort((a, b) => b.likes - a.likes);
        case "latest":
            return [...artworks].sort(
                (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
            );
        case "views":
            return [...artworks].sort((a, b) => b.views - a.views);
        default:
            return artworks;
    }
}

function applyCategoryFilter(artworks, category) {
    if (category === "all") return artworks;
    return artworks.filter((a) =>
        a.tags.some((tag) => tag.toLowerCase() === category.toLowerCase())
    );
}
