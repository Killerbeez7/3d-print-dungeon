import { useState, useEffect, useRef } from "react";
import { useModels } from "@/hooks/useModels";
import { Link } from "react-router-dom";
import { LazyImage } from "@/components/shared/lazy-image/LazyImage";
import { FeaturedCarousel } from "./FeaturedCarousel";
import { featuredMockData } from "./featuredMockData";
import { FilterPanel } from "./FilterPanel";

export const Home = () => {
    const { models, loading } = useModels();
    const [hasMore, setHasMore] = useState(true);
    const [sortBy, setSortBy] = useState("community");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isMainContentVisible, setIsMainContentVisible] = useState(true);
    const mainContentRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsMainContentVisible(entry.isIntersecting);
                if (!entry.isIntersecting && isFilterOpen) {
                    setIsFilterOpen(false);
                }
            },
            {
                threshold: 0.1, // Trigger when at least 10% of the element is visible
                rootMargin: "-100px 0px", // Add some margin to trigger earlier
            }
        );

        if (mainContentRef.current) {
            observer.observe(mainContentRef.current);
        }

        return () => {
            if (mainContentRef.current) {
                observer.unobserve(mainContentRef.current);
            }
        };
    }, [isFilterOpen]);

    if (loading) {
        return <p className="p-4">Loading models...</p>;
    }

    const artworks = models.map((m) => ({
        id: m.id,
        title: m.name || "Untitled Model",
        artist: m.uploaderDisplayName || "Anonymous",
        tags: Array.isArray(m.tags) ? m.tags : ["3D"],
        imageUrl:
            m.primaryRenderLowResUrl || m.primaryRenderUrl || "/image.png",
        likes: m.likes || 0,
        views: m.views || 0,
        createdAt: m.createdAt,
    }));

    const sortedArtworks = applySorting(artworks, sortBy);
    const displayedArtworks = applyCategoryFilter(
        sortedArtworks,
        categoryFilter
    );

    const handleLoadMore = () => {
        setHasMore(false);
    };

    return (
        <div className="text-txt-primary min-h-screen">
            {/* Filter Button */}
            <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`fixed bottom-5 left-5 z-50 bg-accent p-3 rounded-full! secondary-button transition-all duration-300 ${
                    isMainContentVisible
                        ? "opacity-100 translate-x-0"
                        : "opacity-0 -translate-x-4 pointer-events-none"
                }`}>
                {isFilterOpen ? (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                ) : (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                        />
                    </svg>
                )}
            </button>

            {/* Filter Panel */}
            <FilterPanel
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                categoryFilter={categoryFilter}
                setCategoryFilter={setCategoryFilter}
                sortBy={sortBy}
                setSortBy={setSortBy}
            />

            {/* Featured Carousel Section */}
            <FeaturedCarousel items={featuredMockData} />

            {/* Main Content Section */}
            <div ref={mainContentRef} className="mx-auto p-4">
                <h1 className="mb-4 font-bold">Models</h1>
                {/* Gallery Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-1">
                    {displayedArtworks.map((art) => (
                        <Link key={art.id} to={`/model/${art.id}`}>
                            <article className="relative bg-bg-surface rounded-md overflow-hidden shadow-sm hover:shadow-md transition-shadow w-full">
                                <div className="relative w-full aspect-square">
                                    <LazyImage
                                        src={art.imageUrl}
                                        alt={art.title}
                                        className="absolute inset-0 w-full h-full object-cover rounded-md"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0000006f] to-transparent flex items-end justify-start opacity-0 hover:opacity-100 transition-opacity">
                                        <div className="text-white m-2">
                                            <h4 className="font-semibold">
                                                {art.title}
                                            </h4>
                                            <p className="text-sm">
                                                {art.artist}
                                            </p>
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
                            className="cta-button py-2 px-6 rounded-full font-bold">
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
                (a, b) =>
                    (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
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
