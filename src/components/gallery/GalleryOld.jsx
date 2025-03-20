import React, { useState } from "react";

export const Gallery = () => {
    // Mock data
    const initialArtworks = [
        {
            id: 1,
            title: "Cyber Samurai",
            artist: "Jane Doe",
            category: "3D",
            imageUrl: "https://source.unsplash.com/random/400x300?cyber",
            likes: 234,
            views: 3214,
        },
        {
            id: 2,
            title: "Fantasy Landscape",
            artist: "John Smith",
            category: "Concept",
            imageUrl: "https://source.unsplash.com/random/400x300?fantasy",
            likes: 120,
            views: 2100,
        },
        {
            id: 3,
            title: "Sci-Fi Mech",
            artist: "Ali Chen",
            category: "3D",
            imageUrl: "https://source.unsplash.com/random/400x300?robot",
            likes: 89,
            views: 1002,
        },
        {
            id: 4,
            title: "Character Design",
            artist: "Emily Brown",
            category: "2D",
            imageUrl: "https://source.unsplash.com/random/400x300?character",
            likes: 500,
            views: 6000,
        },
        {
            id: 5,
            title: "Nature Sculpt",
            artist: "Mike Tron",
            category: "3D",
            imageUrl: "https://source.unsplash.com/random/400x300?nature",
            likes: 76,
            views: 900,
        },
        {
            id: 6,
            title: "Epic Spaceship",
            artist: "Grace Lin",
            category: "3D",
            imageUrl: "https://source.unsplash.com/random/400x300?spaceship",
            likes: 312,
            views: 2002,
        },
        {
            id: 7,
            title: "Cinematic Scene",
            artist: "Carla Stone",
            category: "Concept",
            imageUrl: "https://source.unsplash.com/random/400x300?cinematic",
            likes: 151,
            views: 1800,
        },
        {
            id: 8,
            title: "Dragon Sketch",
            artist: "Leo Wang",
            category: "2D",
            imageUrl: "https://source.unsplash.com/random/400x300?dragon",
            likes: 220,
            views: 2300,
        },
    ];

    const [artworks, setArtworks] = useState(initialArtworks.slice(0, 8));
    const [hasMore, setHasMore] = useState(true);

    // Sorting and filters
    const [sortBy, setSortBy] = useState("community"); // default
    const [categoryFilter, setCategoryFilter] = useState("all");

    // For mock load-more
    const handleLoadMore = () => {
        // Pretend we fetch the next batch from server. We'll just re-use the same items for demonstration.
        const nextBatch = initialArtworks;
        setArtworks((prev) => [...prev, ...nextBatch]);
        setHasMore(false); // assume no more data after second fetch
    };

    // This is a mock; you can implement real sorting logic
    const sortedArtworks = applySorting(artworks, sortBy);
    // This is a mock; you can implement real category logic
    const displayedArtworks = applyCategoryFilter(
        sortedArtworks,
        categoryFilter
    );

    return (
        <div className="bg-bg-primary text-txt-primary min-h-screen">
            {/* HERO HEADER */}
            <section className="relative bg-gradient-to-r from-accent to-accent-hover px-4 py-12">
      
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
                        <article
                            key={art.id}
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
                                className="w-full h-auto object-cover"
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
 * Mock sorting function. You can replace
 * with real logic or a server-side call.
 */
function applySorting(artworks, sortBy) {
    switch (sortBy) {
        case "popular":
            // e.g. sort by likes descending
            return [...artworks].sort((a, b) => b.likes - a.likes);
        case "latest":
            // pretend 'id' is chronological
            return [...artworks].sort((a, b) => b.id - a.id);
        case "views":
            // sort by views descending
            return [...artworks].sort((a, b) => b.views - a.views);
        default:
            // "community" or default
            return artworks;
    }
}

/**
 * Mock category filter
 */
function applyCategoryFilter(artworks, category) {
    if (category === "all") return artworks;
    return artworks.filter((a) => a.category === category);
}
