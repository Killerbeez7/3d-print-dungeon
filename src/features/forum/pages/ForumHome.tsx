import { useEffect, useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaSearch, FaPlusSquare } from "react-icons/fa";
import { useQueryClient } from "@tanstack/react-query";
import { useFetchThreads, useFetchCategories } from "@/features/forum/hooks";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useModal } from "@/hooks/useModal";
import Skeleton from "@/features/shared/Skeleton";
import { Spinner } from "@/features/shared/reusable/Spinner";
import { isThreadNew, formatRelativeTime } from "@/features/forum/utils/threadUtils";
import { InfiniteScrollList } from "@/features/shared/InfiniteScrollList";
import type { ForumThread, ForumCategory } from "@/features/forum/types/forum";
import type { FC } from "react";

interface ThreadCardProps {
    thread: ForumThread;
    categories: ForumCategory[];
}

export const ForumHome: FC = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { open } = useModal("auth");
    const [activeTab, setActiveTab] = useState<string>("recent");
    const [searchQuery, setSearchQuery] = useState<string>("");

    // Fetch categories
    const { data: categories = [], isLoading: categoriesLoading } = useFetchCategories();

    // Fetch threads based on active tab
    const getThreadFilters = () => {
        switch (activeTab) {
            case "popular":
                return { sortBy: "views" as const, sortOrder: "desc" as const };
            case "unanswered":
                return { filter: "unanswered" as const };
            case "recent":
            default:
                return { sortBy: "createdAt" as const, sortOrder: "desc" as const };
        }
    };

    const {
        data: threadsData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading: threadsLoading,
        isError: threadsError,
    } = useFetchThreads(getThreadFilters());

    // Search functionality
    const {
        data: searchData,
        fetchNextPage: fetchNextSearch,
        hasNextPage: hasNextSearch,
        isFetchingNextPage: isFetchingNextSearch,
        isLoading: searchLoading,
        refetch: refetchSearch,
    } = useFetchThreads({
        search: searchQuery,
        sortBy: "createdAt",
        sortOrder: "desc",
    });

    // Clear search cache when tab changes
    useEffect(() => {
        if (searchQuery) {
            setSearchQuery("");
            queryClient.removeQueries({
                queryKey: ["forum-threads", { search: searchQuery }],
            });
        }
    }, [activeTab, queryClient]);

    // Scroll to top when tab changes
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [activeTab]);

    const handleSearch = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        try {
            await refetchSearch();
        } catch (error) {
            console.error("Error searching threads:", error);
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
        if (searchQuery && searchData) {
            const searchThreads = searchData.pages.flatMap((page) => page.threads);
            return (
                <div className="mt-6 space-y-4">
                    <h2 className="text-lg font-medium">
                        Search Results for &quot;{searchQuery}&quot;
                    </h2>
                    <InfiniteScrollList
                        items={searchThreads}
                        hasMore={hasNextSearch}
                        loadMore={fetchNextSearch}
                        isLoading={isFetchingNextSearch}
                        loader={<Spinner size={24} />}
                    >
                        <div className="space-y-4">
                            {searchThreads.map((thread) => (
                                <ThreadCard
                                    key={thread.id}
                                    thread={thread}
                                    categories={categories}
                                />
                            ))}
                        </div>
                    </InfiniteScrollList>
                </div>
            );
        }

        if (searchQuery && searchData?.pages[0]?.threads.length === 0 && !searchLoading) {
            return (
                <div className="mt-6 bg-[var(--bg-surface)] text-[var(--txt-primary)] rounded-lg shadow p-6 text-center">
                    <p className="text-[var(--txt-muted)]">
                        No results found for &quot;{searchQuery}&quot;. Try a different
                        search term.
                    </p>
                </div>
            );
        }

        if (!searchQuery) {
            const threads = threadsData?.pages.flatMap((page) => page.threads) ?? [];
            return (
                <div className="mt-6">
                    <h2 className="text-lg font-medium mb-4">
                        {activeTab === "recent" && "Recent Discussions"}
                        {activeTab === "popular" && "Popular Discussions"}
                        {activeTab === "unanswered" && "Unanswered Discussions"}
                    </h2>
                    <InfiniteScrollList
                        items={threads}
                        hasMore={hasNextPage}
                        loadMore={fetchNextPage}
                        isLoading={isFetchingNextPage}
                        loader={<Spinner size={24} />}
                    >
                        {threadsLoading && !threads.length ? (
                            <div className="flex justify-center py-10">
                                <Spinner size={24} />
                            </div>
                        ) : threads.length > 0 ? (
                            <div className="space-y-4">
                                {threads.map((thread) => (
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
                                    No {activeTab} discussions yet. Start a new thread!
                                </p>
                            </div>
                        )}
                    </InfiniteScrollList>
                </div>
            );
        }

        return null;
    };

    if (categoriesLoading && !categories.length) {
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

    if (threadsError) {
        return (
            <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg text-red-700 dark:text-red-400">
                <h2 className="text-lg font-semibold mb-2">Error Loading Forum</h2>
                <p>Failed to load forum threads. Please try again.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with search and new thread button */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
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
                            disabled={searchLoading}
                        />
                        <button
                            type="submit"
                            className="absolute right-1 bottom-1 top-1 px-3 rounded bg-[var(--accent)] text-[var(--txt-highlight)] hover:bg-[var(--accent-hover)] focus:outline-none transition"
                            disabled={searchLoading || !searchQuery.trim()}
                        >
                            {searchLoading ? "..." : "Search"}
                        </button>
                    </div>
                </form>

                <button
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold bg-[var(--accent)] text-[var(--txt-highlight)] hover:bg-[var(--accent-hover)] transition-colors"
                    onClick={() => {
                        if (!currentUser) {
                            open({ mode: "login" });
                            return;
                        }
                        navigate("/forum/new-thread");
                    }}
                >
                    <FaPlusSquare size={16} />
                    <span>New Thread</span>
                </button>
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
