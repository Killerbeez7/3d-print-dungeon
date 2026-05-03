import { useEffect, useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaSearch, FaPlusSquare } from "react-icons/fa";
import { useFetchThreads, useFetchCategories } from "@/features/forum/hooks";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useModal } from "@/hooks/useModal";
import Skeleton from "@/features/shared/Skeleton";
import { Spinner } from "@/features/shared/reusable/Spinner";
import { isThreadNew, formatRelativeTime } from "@/features/forum/utils/threadUtils";
import { InfiniteScrollList } from "@/features/shared/InfiniteScrollList";
import { FORUM_CATEGORIES } from "@/config/forumCategories";
import type { ForumThread, ForumCategory } from "@/features/forum/types/forum";
import type { FC } from "react";

interface ThreadCardProps {
    thread: ForumThread;
    categories: ForumCategory[];
}

export const ForumHome: FC = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { open } = useModal("auth");
    const [activeTab, setActiveTab] = useState<string>("recent");
    const [searchQuery, setSearchQuery] = useState<string>("");

    const { data: fetchedCategories = [], isLoading: categoriesLoading } =
        useFetchCategories();

    const categories =
        fetchedCategories.length > 0 ? fetchedCategories : FORUM_CATEGORIES;

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

    useEffect(() => {
        setSearchQuery("");
    }, [activeTab]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [activeTab]);

    const handleSearch = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!searchQuery.trim()) {
            setSearchQuery("");
            return;
        }

        try {
            await refetchSearch();
        } catch (error) {
            console.error("Error searching threads:", error);
        }
    };

    const handleCreateThread = () => {
        if (!currentUser) {
            open({ mode: "login" });
            return;
        }

        navigate("/forum/new-thread");
    };

    const ThreadCard = ({ thread, categories }: ThreadCardProps) => (
        <div className="rounded-lg bg-[var(--bg-surface)] p-6 text-[var(--txt-primary)] shadow">
            <div className="flex items-start justify-between">
                <Link
                    to={`/forum/thread/${thread.id}`}
                    className="text-lg font-medium hover:text-[var(--accent)]"
                >
                    {thread.title}
                    {isThreadNew(thread) && (
                        <span className="ml-2 rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
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

    const renderEmptyState = (
        title: string,
        description: string,
        actionLabel = "Create Thread"
    ) => (
        <div className="flex flex-1 flex-col">
            <h2 className="mb-4 text-lg font-medium text-[var(--txt-primary)]">
                {activeTab === "recent" && !searchQuery && "Recent Discussions"}
                {activeTab === "popular" && !searchQuery && "Popular Discussions"}
                {activeTab === "unanswered" && !searchQuery && "Unanswered Discussions"}
                {searchQuery && `Search results for "${searchQuery.trim()}"`}
            </h2>

            <div className="flex min-h-[320px] flex-1 items-start">
                <div className="w-full rounded-lg bg-[var(--bg-surface)] p-6 text-[var(--txt-primary)] shadow">
                    <h3 className="mb-2 text-3xl font-medium">{title}</h3>
                    <p className="mb-6 max-w-2xl text-[var(--txt-muted)]">
                        {description}
                    </p>

                    <div className="flex flex-wrap gap-3">
                        {searchQuery ? (
                            <button
                                type="button"
                                onClick={() => setSearchQuery("")}
                                className="rounded-lg border border-[var(--br-secondary)] px-4 py-2 text-[var(--txt-primary)] hover:bg-[var(--bg-tertiary)]"
                            >
                                Clear Search
                            </button>
                        ) : null}

                        <button
                            type="button"
                            onClick={handleCreateThread}
                            className="rounded-lg bg-[var(--accent)] px-4 py-2 text-[var(--txt-highlight)] hover:bg-[var(--accent-hover)]"
                        >
                            {actionLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderThreadListForTab = () => {
        if (searchQuery && searchData) {
            const searchThreads = searchData.pages.flatMap((page) => page.threads);

            if (!searchThreads.length) {
                return renderEmptyState(
                    "No matching threads",
                    "Search checks thread titles, content, category names, and tags. Try a broader term or start a new discussion."
                );
            }

            return (
                <div className="mt-6 flex flex-1 flex-col">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <h2 className="text-lg font-medium text-[var(--txt-primary)]">
                            Search results for &quot;{searchQuery.trim()}&quot;
                        </h2>
                        <button
                            type="button"
                            onClick={() => setSearchQuery("")}
                            className="text-sm text-[var(--accent)] hover:underline"
                        >
                            Clear search
                        </button>
                    </div>

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

        const threads = threadsData?.pages.flatMap((page) => page.threads) ?? [];

        if (threadsLoading && !threads.length) {
            return (
                <div className="flex flex-1 items-center justify-center py-10">
                    <Spinner size={24} />
                </div>
            );
        }

        if (!threads.length) {
            return renderEmptyState(
                activeTab === "unanswered"
                    ? "No unanswered threads"
                    : `No ${activeTab} discussions yet`,
                activeTab === "unanswered"
                    ? "Every visible thread has at least one reply. Check another tab or ask a new question."
                    : "Start a focused discussion so other members have something concrete to respond to."
            );
        }

        return (
            <div className="mt-6 flex flex-1 flex-col">
                <h2 className="mb-4 text-lg font-medium text-[var(--txt-primary)]">
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
                    <div className="space-y-4">
                        {threads.map((thread) => (
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
    };

    if (categoriesLoading && !categories.length) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-10 w-32" />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(6)].map((_, i) => (
                        <div
                            key={i}
                            className="rounded-lg bg-white p-4 shadow dark:bg-gray-800"
                        >
                            <Skeleton className="mb-2 h-6 w-12" />
                            <Skeleton className="mb-1 h-4 w-3/4" />
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
                            className="rounded-lg bg-white p-4 shadow dark:bg-gray-800"
                        >
                            <Skeleton className="mb-2 h-6 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (threadsError) {
        return (
            <div className="rounded-lg bg-red-50 p-6 text-red-700 dark:bg-red-900/20 dark:text-red-400">
                <h2 className="mb-2 text-lg font-semibold">Error Loading Forum</h2>
                <p>Failed to load forum threads. Please try again.</p>
            </div>
        );
    }

    return (
        <div className="flex min-h-full flex-col">
            <div className="flex items-center justify-between gap-20 px-5 sm:px-0">
                <form onSubmit={handleSearch} className="max-w-md flex-1">
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <FaSearch className="text-[var(--txt-muted)]" />
                        </div>
                        <input
                            type="search"
                            className="block w-full rounded-lg border border-[var(--br-secondary)] bg-[var(--bg-surface)] p-2.5 pl-10 text-sm text-[var(--txt-primary)] focus:border-[var(--accent)] focus:ring-[var(--accent)]"
                            placeholder="Search discussions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            disabled={searchLoading}
                        />
                        <button
                            type="submit"
                            className="absolute right-1 bottom-1 top-1 rounded bg-[var(--accent)] px-3 text-[var(--txt-highlight)] transition hover:bg-[var(--accent-hover)] focus:outline-none"
                            disabled={searchLoading || !searchQuery.trim()}
                        >
                            {searchLoading ? "..." : "Search"}
                        </button>
                    </div>
                </form>

                <button
                    className="flex items-center gap-2 whitespace-nowrap rounded-[15px] border border-[var(--br-secondary)] px-4 py-2.5 font-semibold text-[var(--txt-highlight)] transition-colors hover:bg-[var(--accent-hover)]"
                    onClick={handleCreateThread}
                >
                    <FaPlusSquare size={16} className="text-[var(--accent)]" />
                    <span className="hidden sm:inline">New Thread</span>
                    <span className="sm:hidden">New</span>
                </button>
            </div>

            <div className="mt-6 border-b border-[var(--br-secondary)]">
                <nav className="flex space-x-8">
                    <button
                        onClick={() => setActiveTab("recent")}
                        className={`border-b-2 px-1 py-4 text-center text-sm font-medium ${
                            activeTab === "recent"
                                ? "border-[var(--accent)] text-[var(--accent)]"
                                : "border-transparent text-[var(--txt-muted)] hover:border-[var(--br-secondary)] hover:text-[var(--txt-primary)]"
                        }`}
                    >
                        Recent
                    </button>
                    <button
                        onClick={() => setActiveTab("popular")}
                        className={`border-b-2 px-1 py-4 text-center text-sm font-medium ${
                            activeTab === "popular"
                                ? "border-[var(--accent)] text-[var(--accent)]"
                                : "border-transparent text-[var(--txt-muted)] hover:border-[var(--br-secondary)] hover:text-[var(--txt-primary)]"
                        }`}
                    >
                        Popular
                    </button>
                    <button
                        onClick={() => setActiveTab("unanswered")}
                        className={`border-b-2 px-1 py-4 text-center text-sm font-medium ${
                            activeTab === "unanswered"
                                ? "border-[var(--accent)] text-[var(--accent)]"
                                : "border-transparent text-[var(--txt-muted)] hover:border-[var(--br-secondary)] hover:text-[var(--txt-primary)]"
                        }`}
                    >
                        Unanswered
                    </button>
                </nav>
            </div>

            <div className="flex flex-1 flex-col">
                {renderThreadListForTab()}
            </div>
        </div>
    );
};