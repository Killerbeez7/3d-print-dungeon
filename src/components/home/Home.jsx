import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { LazyImage } from "@/components/shared/lazy-image/LazyImage";
import { FeaturedCarousel } from "./FeaturedCarousel";
import { featuredMockData } from "./featuredMockData";
import { FilterPanel } from "./FilterPanel";
import { InfiniteScrollList } from "@/components/shared/InfiniteScrollList";
import { collection, query, orderBy, limit, getDocs, startAfter } from "firebase/firestore";
import { db } from "@/config/firebase";

const PAGE_SIZE = 30;

async function fetchModelsPage(lastDoc = null) {
    let q = query(
        collection(db, "models"),
        orderBy("createdAt", "desc"),
        limit(PAGE_SIZE)
    );
    if (lastDoc) {
        q = query(
            collection(db, "models"),
            orderBy("createdAt", "desc"),
            startAfter(lastDoc),
            limit(PAGE_SIZE)
        );
    }
    const snapshot = await getDocs(q);
    return {
        models: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
        lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
        hasMore: snapshot.docs.length === PAGE_SIZE
    };
}

export const Home = () => {
    const [models, setModels] = useState([]);
    const [lastDoc, setLastDoc] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState("community");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isMainContentVisible, setIsMainContentVisible] = useState(true);
    const mainContentRef = useRef(null);

    // Initial load
    useEffect(() => {
        setLoading(true);
        fetchModelsPage().then(({ models, lastDoc, hasMore }) => {
            setModels(models);
            setLastDoc(lastDoc);
            setHasMore(hasMore);
            setLoading(false);
        });
    }, []);

    // Loader for InfiniteScrollList
    const loadMoreModels = useCallback(() => {
        if (!hasMore || loading) return;
        setLoading(true);
        fetchModelsPage(lastDoc).then(({ models: newModels, lastDoc: newLastDoc, hasMore: more }) => {
            setModels(prev => [...prev, ...newModels]);
            setLastDoc(newLastDoc);
            setHasMore(more);
            setLoading(false);
        });
    }, [lastDoc, hasMore, loading]);

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

    if (loading && models.length === 0) {
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

    return (
        <div className="text-txt-primary min-h-screen px-4 md:px-10 2xl:px-18">
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
            <FeaturedCarousel items={featuredMockData} itemHeight={180} slidesToShow={5} />

            {/* Main Content Section */}
            <div ref={mainContentRef} className="mx-auto p-4">
                <h1 className="mb-4 font-bold">Models</h1>
                <InfiniteScrollList
                    items={displayedArtworks}
                    hasMore={hasMore}
                    loadMore={loadMoreModels}
                    loader={<div className="text-center my-4">Loading more models...</div>}
                >
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
                </InfiniteScrollList>
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
