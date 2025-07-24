import { useEffect, useState, useRef, FormEvent } from "react";
import { Link } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import { useForum } from "@/features/forum/hooks/useForum";
import { forumService } from "@/features/forum/services/forumService";
import Skeleton from "@/features/shared/Skeleton";
import { Spinner } from "@/features/shared/reusable/Spinner";
import { isThreadNew, formatRelativeTime } from "@/features/forum/utils/threadUtils";
import type { ForumThread, ForumCategory } from "@/features/forum/types/forum";

interface ThreadCardProps {
    thread: ForumThread;
    categories: ForumCategory[];
}

export const ForumHome = () => {
    const { categories, threads, loading, error, searchThreads } = useForum();
    const [displayedThreads, setDisplayedThreads] = useState<ForumThread[]>([]);
    const [lastVisible, setLastVisible] = useState<unknown>(null);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [loadingMore, setLoadingMore] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<string>("recent");
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [searchResults, setSearchResults] = useState<ForumThread[]>([]);
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Reset search when tab changes
        if (searchQuery) {
            setSearchQuery("");
            setSearchResults([]);
        }
    }, [activeTab]);

    // Scroll to top when tab changes
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [activeTab]);

    // Reset loaded threads on refresh
    useEffect(() => {
        setDisplayedThreads([]);
        setLastVisible(null);
        setHasMore(true);
    }, []);

    // Fetch first 10 threads on mount
    useEffect(() => {
        const fetchInitialThreads = async () => {
            setLoadingMore(true);
            try {
                const result = await forumService.getNewestThreads(10);
                const threads: ForumThread[] = Array.isArray(result)
                    ? result
                    : result.threads || [];
                setDisplayedThreads(threads);
                setLastVisible(result.lastVisible || null);
                setHasMore(
                    result.hasMore !== undefined ? result.hasMore : threads.length === 10
                );
            } catch (error) {
                console.error("Error fetching initial threads:", error);
            } finally {
                setLoadingMore(false);
            }
        };
        fetchInitialThreads();
    }, []);

    // Throttled scroll handler with inline loadMoreThreads
    useEffect(() => {
        const handleScroll = () => {
            if (scrollTimeoutRef.current) return;

            scrollTimeoutRef.current = setTimeout(async () => {
                const totalHeight = document.documentElement.scrollHeight;
                const scrollY = window.scrollY;
                const innerHeight = window.innerHeight;
                const scrolled = scrollY + innerHeight;
                const scrollPercent = scrolled / totalHeight;

                // trigger loading when user has scrolled past 80% of the page
                if (scrollPercent > 0.8 && hasMore && !loadingMore && lastVisible) {
                    try {
                        setLoadingMore(true);
                        const result = await forumService.getMoreNewestThreads(
                            lastVisible,
                            5
                        );
                        const threads: ForumThread[] = Array.isArray(result)
                            ? result
                            : result.threads || [];
                        if (threads.length === 0) {
                            setHasMore(false);
                            return;
                        }
                        setDisplayedThreads((prev) => [...prev, ...threads]);
                        setLastVisible(result.lastVisible || null);
                        setHasMore(
                            result.hasMore !== undefined
                                ? result.hasMore
                                : threads.length === 5
                        );
                    } catch (error) {
                        console.error("Error loading more threads:", error);
                        setHasMore(false);
                    } finally {
                        setLoadingMore(false);
                    }
                }

                scrollTimeoutRef.current = null;
            }, 200);
        };

        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
        };
    }, [hasMore, loadingMore, lastVisible]);

    const handleSearch = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!searchQuery.trim()) return;

        setIsSearching(true);
        try {
            const results: ForumThread[] = await searchThreads(searchQuery);
            setSearchResults(results);
        } catch (error) {
            console.error("Error searching threads:", error);
        } finally {
            setIsSearching(false);
        }
    };

    // Thread card component for reuse
    const ThreadCard = ({ thread, categories }: ThreadCardProps) => (
        <div className="bg-[var(--bg-surface)] text-[var(--txt-primary)] rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
                <Link
                    to={`/forum/thread/${thread.id}`}
                    className="text-lg font-medium hover:text-[var(--accent)]"
                >
                    {thread.title}
                    {isThreadNew(thread) && (
                        <span className="ml-2 text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                            New
                        </span>
                    )}
                </Link>
            </div>

            <div className="mt-2 text-sm text-[var(--txt-muted)]">
                Posted in{" "}
                <Link
                    to={`/forum/category/${thread.categoryId}`}
                    className="text-[var(--accent)] hover:underline"
                >
                    {categories.find((c) => c.id === thread.categoryId)?.name ||
                        "Unknown Category"}
                </Link>
                {" · "}
                {formatRelativeTime(thread.createdAt)}
                {thread.replyCount !== undefined && (
                    <>
                        {" · "}
                        {thread.replyCount}{" "}
                        {thread.replyCount === 1 ? "reply" : "replies"}
                    </>
                )}
                {thread.views !== undefined && (
                    <>
                        {" · "}
                        {thread.views} {thread.views === 1 ? "view" : "views"}
                    </>
                )}
            </div>
        </div>
    );

    const renderThreadListForTab = () => {
        if (searchQuery && searchResults.length > 0) {
            return (
                <div className="mt-6 space-y-4">
                    <h2 className="text-lg font-medium">
                        Search Results for &quot;{searchQuery}&quot;
                    </h2>
                    <div className="space-y-4">
                        {searchResults.map((thread) => (
                            <ThreadCard
                                key={thread.id}
                                thread={thread}
                                categories={categories}
                            />
                        ))}
                    </div>
                </div>
            );
        }

        if (searchQuery && searchResults.length === 0 && !isSearching) {
            return (
                <div className="mt-6 bg-[var(--bg-surface)] text-[var(--txt-primary)] rounded-lg shadow p-6 text-center">
                    <p className="text-[var(--txt-muted)]">
                        No results found for &quot;{searchQuery}&quot;. Try a different
                        search term.
                    </p>
                </div>
            );
        }

        if (activeTab === "recent" && !searchQuery) {
            return (
                <div className="mt-6">
                    <h2 className="text-lg font-medium mb-4">Recent Discussions</h2>
                    {displayedThreads.length > 0 ? (
                        <div className="space-y-4">
                            {displayedThreads.map((thread) => (
                                <ThreadCard
                                    key={thread.id}
                                    thread={thread}
                                    categories={categories}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-[var(--bg-surface)] text-[var(--txt-primary)] rounded-lg shadow p-6 text-center">
                            <p className="text-[var(--txt-muted)]">
                                No recent discussions yet. Start a new thread!
                            </p>
                        </div>
                    )}
                    {loadingMore && (
                        <div className="flex justify-center mt-4">
                            <Spinner size={24} />
                        </div>
                    )}
                </div>
            );
        }

        switch (activeTab) {
            case "popular":
                return (
                    <div className="mt-6">
                        <h2 className="text-lg font-medium mb-4">Popular Discussions</h2>
                        {threads.popular?.length > 0 ? (
                            <div className="space-y-4">
                                {threads.popular.map((thread) => (
                                    <ThreadCard
                                        key={thread.id}
                                        thread={thread}
                                        categories={categories}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-[var(--bg-surface)] text-[var(--txt-primary)] rounded-lg shadow p-6 text-center">
                                <p className="text-[var(--txt-muted)]">
                                    No popular discussions yet. Start a new thread!
                                </p>
                            </div>
                        )}
                    </div>
                );

            case "unanswered":
                return (
                    <div className="mt-6">
                        <h2 className="text-lg font-medium mb-4">
                            Unanswered Discussions
                        </h2>
                        {threads.unanswered?.length > 0 ? (
                            <div className="space-y-4">
                                {threads.unanswered.map((thread) => (
                                    <ThreadCard
                                        key={thread.id}
                                        thread={thread}
                                        categories={categories}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-[var(--bg-surface)] text-[var(--txt-primary)] rounded-lg shadow p-6 text-center">
                                <p className="text-[var(--txt-muted)]">
                                    All discussions have been answered. Great job
                                    community!
                                </p>
                            </div>
                        )}
                    </div>
                );

            default:
                return null;
        }
    };

    if (loading && !categories.length) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-10 w-32" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div
                            key={i}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"
                        >
                            <Skeleton className="h-6 w-12 mb-2" />
                            <Skeleton className="h-4 w-3/4 mb-1" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    ))}
                </div>

                <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-700">
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-10 w-24" />
                    ))}
                </div>

                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div
                            key={i}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"
                        >
                            <Skeleton className="h-6 w-3/4 mb-2" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg text-red-700 dark:text-red-400">
                <h2 className="text-lg font-semibold mb-2">Error Loading Forum</h2>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with search and new thread button */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <form onSubmit={handleSearch} className="flex-1 max-w-md">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <FaSearch className="text-[var(--txt-muted)]" />
                        </div>
                        <input
                            type="search"
                            className="block w-full p-2.5 pl-10 text-sm bg-[var(--bg-surface)] text-[var(--txt-primary)] rounded-lg border border-[var(--br-secondary)] focus:ring-[var(--accent)] focus:border-[var(--accent)]"
                            placeholder="Search discussions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            disabled={isSearching}
                        />
                        <button
                            type="submit"
                            className="absolute right-1 bottom-1 top-1 px-3 rounded bg-[var(--accent)] text-[var(--txt-highlight)] hover:bg-[var(--accent-hover)] focus:outline-none transition"
                            disabled={isSearching || !searchQuery.trim()}
                        >
                            {isSearching ? "..." : "Search"}
                        </button>
                    </div>
                </form>
            </div>

            {/* Tabs */}
            <div className="border-b border-[var(--br-secondary)]">
                <nav className="flex space-x-8">
                    <button
                        onClick={() => setActiveTab("recent")}
                        className={`py-4 px-1 text-center border-b-2 font-medium text-sm ${
                            activeTab === "recent"
                                ? "border-[var(--accent)] text-[var(--accent)]"
                                : "border-transparent text-[var(--txt-muted)] hover:text-[var(--txt-primary)] hover:border-[var(--br-secondary)]"
                        }`}
                    >
                        Recent
                    </button>
                    <button
                        onClick={() => setActiveTab("popular")}
                        className={`py-4 px-1 text-center border-b-2 font-medium text-sm ${
                            activeTab === "popular"
                                ? "border-[var(--accent)] text-[var(--accent)]"
                                : "border-transparent text-[var(--txt-muted)] hover:text-[var(--txt-primary)] hover:border-[var(--br-secondary)]"
                        }`}
                    >
                        Popular
                    </button>
                    <button
                        onClick={() => setActiveTab("unanswered")}
                        className={`py-4 px-1 text-center border-b-2 font-medium text-sm ${
                            activeTab === "unanswered"
                                ? "border-[var(--accent)] text-[var(--accent)]"
                                : "border-transparent text-[var(--txt-muted)] hover:text-[var(--txt-primary)] hover:border-[var(--br-secondary)]"
                        }`}
                    >
                        Unanswered
                    </button>
                </nav>
            </div>

            {/* Thread list by tab */}
            {renderThreadListForTab()}
        </div>
    );
};
