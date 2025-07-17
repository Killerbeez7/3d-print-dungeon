import { Link } from "react-router-dom";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useState, useCallback, useRef, useEffect } from "react";
// config
import { STATIC_ASSETS } from "@/config/assetsConfig";
// service
import { fetchModels, PAGE_SIZE } from "@/features/models/services/modelsService";
// components
import { FilterPanel } from "../components/FilterPanel";
import { Spinner } from "@/features/shared/reusable/Spinner";
import { FeaturedCarousel } from "../components/FeaturedCarousel";
import { featuredMockData } from "../components/featuredMockData";
import { ModelCardSkeleton } from "@/features/models/components/ModelCardSkeleton";
import { InfiniteScrollList } from "@/features/shared/InfiniteScrollList";
import { SequentialImage } from "@/features/shared/reusable/SequentialImage";
import { getThumbnailUrl } from "@/utils/imageUtils";
import { Artwork, SortBy } from "@/features/home/types/home";
import type { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import { InfiniteData } from "@tanstack/react-query";

// Firestore model doc type (adjust as needed)
type ModelDoc = {
    id: string;
    name?: string;
    uploaderDisplayName?: string;
    tags?: string[];
    renderPrimaryUrl?: string;
    likes?: number;
    views?: number;
    createdAt?: { seconds?: number } | number | string | null;
};
type Page = {
    models: ModelDoc[];
    nextCursor: QueryDocumentSnapshot<DocumentData> | undefined;
};

function getCreatedAtSeconds(val: Artwork["createdAt"]): number {
    if (
        val &&
        typeof val === "object" &&
        "seconds" in val &&
        typeof val.seconds === "number"
    ) {
        return val.seconds;
    }
    if (typeof val === "number") return val;
    return 0;
}

function applySorting(items: Artwork[], sortBy: SortBy): Artwork[] {
    switch (sortBy) {
        case "popular":
            return [...items].sort((a, b) => b.likes - a.likes);
        case "latest":
            return [...items].sort(
                (a, b) =>
                    getCreatedAtSeconds(b.createdAt) - getCreatedAtSeconds(a.createdAt)
            );
        case "views":
            return [...items].sort((a, b) => b.views - a.views);
        default:
            return items;
    }
}

function applyCategoryFilter(items: Artwork[], category: string): Artwork[] {
    if (category === "all") return items;
    return items.filter(
        (a) =>
            Array.isArray(a.tags) &&
            a.tags.some((tag) => tag.toLowerCase() === category.toLowerCase())
    );
}

export const HomePage = (): React.ReactNode => {
    const [sortBy, setSortBy] = useState<SortBy>("community");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");
    const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);

    // sequential loader index
    const [loadIndex, setLoadIndex] = useState<number>(0);
    const bumpIndex = useCallback(() => setLoadIndex((i) => i + 1), []);

    // infinite scroll via TanStack Query
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
        useInfiniteQuery<
            Page,
            Error,
            InfiniteData<Page>,
            string[],
            QueryDocumentSnapshot<DocumentData> | undefined
        >({
            queryKey: ["models", sortBy, categoryFilter],
            queryFn: ({ pageParam }) => fetchModels(pageParam),
            getNextPageParam: (last) => last.nextCursor,
            initialPageParam: undefined,
        });

    // flatten pages
    const raw: ModelDoc[] = data?.pages.flatMap((p) => p.models) ?? [];

    // FAB hide/show on scroll
    const mainRef = useRef<HTMLDivElement>(null);
    const [fabVisible, setFabVisible] = useState<boolean>(true);
    useEffect(() => {
        const obs = new IntersectionObserver(([e]) => setFabVisible(e.isIntersecting), {
            threshold: 0.1,
            rootMargin: "-100px 0px",
        });
        if (mainRef.current) obs.observe(mainRef.current);
        return () => obs.disconnect();
    }, []);

    // map to "artwork" shape
    const artworks: Artwork[] = raw.map((m) => {
        const thumbUrl =
            getThumbnailUrl(m.renderPrimaryUrl ?? null, "MEDIUM") ||
            STATIC_ASSETS.PLACEHOLDER_IMAGE;

        return {
            id: String(m.id),
            title: typeof m.name === "string" ? m.name : "Untitled",
            artist:
                typeof m.uploaderDisplayName === "string"
                    ? m.uploaderDisplayName
                    : "Unknown",
            tags: Array.isArray(m.tags) ? m.tags : [],
            thumbnailUrl:
                typeof thumbUrl === "string" ? thumbUrl : STATIC_ASSETS.PLACEHOLDER_IMAGE,
            likes: typeof m.likes === "number" ? m.likes : 0,
            views: typeof m.views === "number" ? m.views : 0,
            createdAt: m.createdAt,
        };
    });

    // apply sort & filter
    const sorted: Artwork[] = applySorting(artworks, sortBy);
    const filtered: Artwork[] = applyCategoryFilter(sorted, categoryFilter);

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
                setSortBy={(sort) => setSortBy(sort as SortBy)}
            />

            {/* featured carousel */}
            <FeaturedCarousel
                items={featuredMockData}
                itemHeight={180}
                slidesToShow={5}
            />

            {/* grid */}
            <div ref={mainRef} className="mx-auto p-4">
                <h1 className="mb-4 font-bold text-[0.3rem] md:text-[0.75rem] lg:text-[1rem]">
                    Models
                </h1>

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
                                    <div className="aspect-square min-h-[1px]">
                                        <SequentialImage
                                            index={idx}
                                            loadIndex={loadIndex}
                                            src={art.thumbnailUrl}
                                            alt={art.title}
                                            onLoad={bumpIndex}
                                            width={400}
                                            height={400}
                                        />
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#000000dc] to-transparent flex items-end opacity-0 hover:opacity-100 transition-opacity rounded-md">
                                        <div className="text-white m-2">
                                            <h2 className="font-semibold" style={{ fontSize: "1rem" }}>{art.title}</h2>
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
