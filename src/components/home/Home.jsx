import { useState, useCallback, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useInfiniteQuery } from "@tanstack/react-query";

import { LazyImage } from "@/components/shared/lazy-image/LazyImage";
import { FeaturedCarousel } from "./FeaturedCarousel";
import { featuredMockData } from "./featuredMockData";
import { FilterPanel } from "./FilterPanel";
import { InfiniteScrollList } from "@/components/shared/InfiniteScrollList";
import { Spinner } from "@/components/shared/Spinner";

import { fetchModels } from "@/services/modelsService";

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

export const Home = () => {
    /* ---------- UI state (filters) ---------- */
    const [sortBy, setSortBy] = useState("community");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    /* ---------- React Query (infinite scroll) ---------- */
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
        queryKey: ["models", sortBy, categoryFilter],
        queryFn: ({ pageParam }) => fetchModels(pageParam),
        getNextPageParam: (last) => last.nextCursor,
        suspense: true,
    });

    /* flatten pages */
    const rawModels = data?.pages.flatMap((p) => p.models) ?? [];

    /* ---------- scroll helper for FAB visibility ---------- */
    const mainRef = useRef(null);
    const [isMainVisible, setIsMainVisible] = useState(true);

    useEffect(() => {
        const obs = new IntersectionObserver(
            ([entry]) => setIsMainVisible(entry.isIntersecting),
            { threshold: 0.1, rootMargin: "-100px 0px" }
        );
        if (mainRef.current) obs.observe(mainRef.current);
        return () => obs.disconnect();
    }, []);

    /* ---------- derived artwork list ---------- */
    const artworks = rawModels.map((m) => ({
        id: m.id,
        title: m.name || "Untitled Model",
        artist: m.uploaderDisplayName || "Anonymous",
        tags: Array.isArray(m.tags) ? m.tags : ["3D"],
        imageUrl: m.primaryRenderLowResUrl || m.primaryRenderUrl || "/image.png",
        likes: m.likes || 0,
        views: m.views || 0,
        createdAt: m.createdAt,
    }));

    const sorted = applySorting(artworks, sortBy);
    const filtered = applyCategoryFilter(sorted, categoryFilter);

    /* ---------- handlers ---------- */
    const loadMore = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage) fetchNextPage();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    /* ---------- render ---------- */
    return (
        <div className="text-txt-primary min-h-screen px-4 md:px-10 2xl:px-18">
            {/* Floating filter FAB */}
            <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`fixed bottom-5 left-5 z-50 bg-accent p-3 rounded-full secondary-button transition-all duration-300 ${
                    isMainVisible
                        ? "opacity-100 translate-x-0"
                        : "opacity-0 -translate-x-4 pointer-events-none"
                }`}
                aria-label="Filters"
            >
                {isFilterOpen ? (
                    <svg viewBox="0 0 24 24" className="h-6 w-6">
                        <path
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                ) : (
                    <svg viewBox="0 0 24 24" className="h-6 w-6">
                        <path
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 4h18v2.586l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3 6.586V4z"
                        />
                    </svg>
                )}
            </button>

            {/* Filter drawer */}
            <FilterPanel
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                categoryFilter={categoryFilter}
                setCategoryFilter={setCategoryFilter}
                sortBy={sortBy}
                setSortBy={setSortBy}
            />

            {/* Featured carousel */}
            <FeaturedCarousel
                items={featuredMockData}
                itemHeight={180}
                slidesToShow={5}
            />

            {/* Grid of models */}
            <div ref={mainRef} className="mx-auto p-4">
                <h1 className="mb-4 font-bold">Models</h1>

                <InfiniteScrollList
                    items={filtered}
                    hasMore={hasNextPage}
                    loadMore={loadMore}
                    loader={
                        <div className="flex justify-center my-4">
                            <Spinner size={24} />
                        </div>
                    }
                >
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-1">
                        {filtered.map((art) => (
                            <Link key={art.id} to={`/model/${art.id}`}>
                                <article className="relative bg-bg-surface rounded-md overflow-hidden shadow-sm hover:shadow-md transition-shadow w-full">
                                    <div className="relative w-full aspect-square">
                                        <LazyImage
                                            src={art.imageUrl}
                                            alt={art.title}
                                            className="absolute inset-0 w-full h-full object-cover rounded-md"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0000006f] to-transparent flex items-end opacity-0 hover:opacity-100 transition-opacity rounded-md">
                                            <div className="text-white m-2">
                                                <h4 className="font-semibold">
                                                    {art.title}
                                                </h4>
                                                <p className="text-sm">{art.artist}</p>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            </Link>
                        ))}
                    </div>
                </InfiniteScrollList>

                {!hasNextPage && filtered.length > 0 && (
                    <p className="text-center text-[var(--txt-muted)] mt-6">
                        You’ve reached the end.
                    </p>
                )}
            </div>
        </div>
    );
};
