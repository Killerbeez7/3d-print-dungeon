import { Link } from "react-router-dom";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useState, useCallback, useRef, useEffect } from "react";
// config
import { STATIC_ASSETS } from "@/config/assetsConfig";
// service
import { fetchModels, PAGE_SIZE } from "@/services/modelsService";
// components
import { FilterPanel } from "./FilterPanel";
import { Spinner } from "@/components/shared/Spinner";
import { FeaturedCarousel } from "./FeaturedCarousel";
import { featuredMockData } from "./featuredMockData";
import { ModelCardSkeleton } from "../models/parts/ModelCardSkeleton";
import { InfiniteScrollList } from "@/components/shared/InfiniteScrollList";
import { SequentialImage } from "@/components/shared/SequentialImage";

function applySorting(items, sortBy) {
    switch (sortBy) {
        case "popular":
            return [...items].sort((a, b) => b.likes - a.likes);
        case "latest":
            return [...items].sort(
                (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
            );
        case "views":
            return [...items].sort((a, b) => b.views - a.views);
        default:
            return items;
    }
}

function applyCategoryFilter(items, category) {
    if (category === "all") return items;
    return items.filter((a) =>
        a.tags.some((tag) => tag.toLowerCase() === category.toLowerCase())
    );
}

export const Home = () => {
    // UI state
    const [sortBy, setSortBy] = useState("community");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // sequential loader index
    const [loadIndex, setLoadIndex] = useState(0);
    const bumpIndex = useCallback(() => setLoadIndex((i) => i + 1), []);

    // infinite scroll via TanStack Query
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
        useInfiniteQuery({
            queryKey: ["models", sortBy, categoryFilter],
            queryFn: ({ pageParam }) => fetchModels(pageParam),
            getNextPageParam: (last) => last.nextCursor,
        });

    // flatten pages
    const raw = data?.pages.flatMap((p) => p.models) ?? [];

    // FAB hide/show on scroll
    const mainRef = useRef(null);
    const [fabVisible, setFabVisible] = useState(true);
    useEffect(() => {
        const obs = new IntersectionObserver(([e]) => setFabVisible(e.isIntersecting), {
            threshold: 0.1,
            rootMargin: "-100px 0px",
        });
        if (mainRef.current) obs.observe(mainRef.current);
        return () => obs.disconnect();
    }, []);

    const addThumb = (full) => {
        if (!full) return STATIC_ASSETS.PLACEHOLDER_IMAGE;

        // Remove any old query string
        const [base] = full.split("?");
        // Make the 400 × 400 WEBP + add ?alt=media
        const dot = base.lastIndexOf(".");
        if (dot === -1) return full; // safety
        return `${base.slice(0, dot)}_400x400.webp?alt=media`;
    };

    // map to “artwork” shape
    const artworks = raw.map((m) => {
        const thumbUrl = addThumb(m.renderPrimaryUrl);

        return {
            id: m.id,
            title: m.name,
            artist: m.uploaderDisplayName,
            tags: m.tags || [],
            thumbnailUrl: thumbUrl,
            likes: m.likes || 0,
            views: m.views || 0,
            createdAt: m.createdAt,
        };
    });

    // apply sort & filter
    const sorted = applySorting(artworks, sortBy);
    const filtered = applyCategoryFilter(sorted, categoryFilter);

    // fetch next page
    const loadMore = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage) fetchNextPage();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    if (isLoading) {
        return (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1 p-4">
                {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                    <ModelCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    return (
        <div className="text-txt-primary min-h-screen px-4 md:px-10 2xl:px-18">
            {/* filter FAB */}
            <button
                onClick={() => setIsFilterOpen((v) => !v)}
                aria-label="Filters"
                className={`
          fixed bottom-5 left-5 z-50 p-3 rounded-full
          bg-accent secondary-button transition-all duration-300
          ${fabVisible ? "opacity-100" : "opacity-0 pointer-events-none -translate-x-4"}
        `}
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

            {/* filter panel */}
            <FilterPanel
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                categoryFilter={categoryFilter}
                setCategoryFilter={setCategoryFilter}
                sortBy={sortBy}
                setSortBy={setSortBy}
            />

            {/* featured carousel */}
            <FeaturedCarousel
                items={featuredMockData}
                itemHeight={180}
                slidesToShow={5}
            />

            {/* grid */}
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
                        {filtered.map((art, idx) => (
                            <Link key={art.id} to={`/model/${art.id}`}>
                                <article className="relative bg-bg-surface rounded-md overflow-hidden shadow-sm hover:shadow-md transition-shadow w-full">
                                    <SequentialImage
                                        index={idx}
                                        loadIndex={loadIndex}
                                        src={art.thumbnailUrl}
                                        alt={art.title}
                                        onLoad={bumpIndex}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0000006f] to-transparent flex items-end opacity-0 hover:opacity-100 transition-opacity rounded-md">
                                        <div className="text-white m-2">
                                            <h4 className="font-semibold">{art.title}</h4>
                                            <p className="text-sm">{art.artist}</p>
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
