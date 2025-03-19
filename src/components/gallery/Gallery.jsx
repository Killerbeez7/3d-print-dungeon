// components/gallery/Gallery.jsx
import React, { useState, useEffect } from "react";
import { useModels } from "../../contexts/modelsContext";
import { Link } from "react-router-dom";

export const Gallery = () => {
    const { models, loading } = useModels();

    // We transform Firestore docs into "artworks" that your sorting/filter expects.
    const [artworks, setArtworks] = useState([]);
    const [hasMore, setHasMore] = useState(true);

    // Sorting and filters
    const [sortBy, setSortBy] = useState("community"); // default
    const [categoryFilter, setCategoryFilter] = useState("all");

    useEffect(() => {
        if (!models) return;
        // Transform Firestore docs -> "artworks"
        const transformed = models.map((m) => ({
            id: m.id,
            title: m.name || "Untitled Model",
            artist: m.userId || "Anonymous",
            category: m.type || "3D",
            imageUrl:
                m.fileUrl ||
                "https://source.unsplash.com/random/400x300?3dmodel",
            likes: 0, // placeholder
            views: 0, // placeholder
        }));
        setArtworks(transformed);
    }, [models]);

    if (loading) {
        return <p className="p-4">Loading models...</p>;
    }

    // Sort & filter
    const sortedArtworks = applySorting(artworks, sortBy);
    const displayedArtworks = applyCategoryFilter(
        sortedArtworks,
        categoryFilter
    );

    // Mock "Load More"
    const handleLoadMore = () => {
        setHasMore(false);
    };

    return (
        <div className="bg-bg-primary text-txt-primary min-h-screen">
            {/* HERO HEADER */}
            <section className="relative bg-gradient-to-r from-accent to-accent-hover px-4 py-12">
                {/* keep hero banner or text here */}
            </section>

            {/* FILTERS / SORTING BAR */}
            <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex items-center mb-3 md:mb-0 space-x-2">
                    <label
                        htmlFor="category"
                        className="text-txt-secondary font-medium"
                    >
                        Category:
                    </label>
                    <select
                        id="category"
                        className="border border-br-primary bg-bg-surface px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-accent"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <option value="all">All</option>
                        <option value="2D">2D</option>
                        <option value="3D">3D</option>
                        <option value="Concept">Concept</option>
                    </select>
                </div>

                <div className="flex items-center space-x-2">
                    <label
                        htmlFor="sortBy"
                        className="text-txt-secondary font-medium"
                    >
                        Sort by:
                    </label>
                    <select
                        id="sortBy"
                        className="border border-br-primary bg-bg-surface px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-accent"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="community">Community</option>
                        <option value="popular">Popular</option>
                        <option value="latest">Latest</option>
                        <option value="views">Most Viewed</option>
                    </select>
                </div>
            </div>

            {/* GALLERY GRID */}
            <div className="container mx-auto px-4 pb-8">
                <div
                    className="
            grid grid-cols-1 
            sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 
            gap-4
          "
                >
                    {displayedArtworks.map((art) => (
                        <Link key={art.id} to={`/model/${art.id}`}>
                            <article
                                className="
                  relative bg-bg-surface border border-br-primary 
                  rounded-md overflow-hidden shadow-sm
                  hover:shadow-md transition-shadow
                "
                            >
                                {/* Artwork image */}
                                <img
                                    src={art.imageUrl}
                                    alt={art.title}
                                    style={{
                                        width: "100%",
                                        height: "200px",
                                        objectFit: "cover",
                                    }}
                                />

                                {/* Info area */}
                                <div className="p-3">
                                    <h2 className="text-lg font-semibold mb-1">
                                        {art.title}
                                    </h2>
                                    <p className="text-txt-secondary text-sm mb-2">
                                        By {art.artist}
                                    </p>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-txt-secondary">
                                            <i className="fas fa-heart text-error mr-1"></i>
                                            {art.likes}
                                        </span>
                                        <span className="text-txt-secondary">
                                            <i className="fas fa-eye text-txt-highlight mr-1"></i>
                                            {art.views}
                                        </span>
                                    </div>
                                </div>
                            </article>
                        </Link>
                    ))}
                </div>

                {/* LOAD MORE BUTTON */}
                {hasMore && (
                    <div className="text-center mt-8">
                        <button
                            onClick={handleLoadMore}
                            className="
                bg-accent text-white py-2 px-6 rounded-full 
                font-medium hover:bg-accent-hover 
                transition-colors
              "
                        >
                            Load More
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

/**
 * Apply sorting to the artworks array
 */
function applySorting(artworks, sortBy) {
    switch (sortBy) {
        case "popular":
            // sort by likes descending
            return [...artworks].sort((a, b) => b.likes - a.likes);
        case "latest":
            // no real "date" in these placeholders, but you can sort by ID or something else
            return [...artworks];
        case "views":
            // sort by views descending
            return [...artworks].sort((a, b) => b.views - a.views);
        default:
            // "community" or default
            return artworks;
    }
}

/**
 * Filter by category
 */
function applyCategoryFilter(artworks, category) {
    if (category === "all") return artworks;
    return artworks.filter(
        (a) => a.category.toLowerCase() === category.toLowerCase()
    );
}
