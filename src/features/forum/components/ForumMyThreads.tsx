import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useFetchThreads, useFetchCategories } from "@/features/forum/hooks";
import {
    FaEye,
    FaComment,
    FaCalendar,
    FaFilter,
    FaChartLine,
    FaEdit,
    FaTrash,
    FaStar,
    FaLock,
    FaThumbtack,
} from "react-icons/fa";
import { formatRelativeTime } from "@/features/forum/utils/threadUtils";
import { FORUM_PATHS, FORUM_HOME_PATH } from "@/features/forum/constants/forumPaths";
import Skeleton from "@/features/shared/Skeleton";
import type { FC } from "react";
import type { ForumThread } from "@/features/forum/types/forum";
import type { FetchThreadsOptions } from "../services/forumService";

type SortOption = "newest" | "oldest" | "mostViews" | "mostReplies" | "lastActivity";
type FilterOption = "all" | "recent" | "popular" | "unanswered" | "pinned";

export const ForumMyThreads: FC = () => {
    const { currentUser } = useAuth();
    const { data: categories = [] } = useFetchCategories();

    const [sortBy, setSortBy] = useState<SortOption>("newest");
    const [filterBy, setFilterBy] = useState<FilterOption>("all");
    const [searchQuery, setSearchQuery] = useState<string>("");

    // Fetch user's threads
    const getThreadFilters = () => {
        const filters: {
            authorId: string;
            sortBy?: string;
            sortOrder?: string;
            filter?: string;
            timeFrame?: string;
        } = { authorId: currentUser?.uid || "" };

        // Apply sorting
        switch (sortBy) {
            case "newest":
                filters.sortBy = "createdAt";
                filters.sortOrder = "desc";
                break;
            case "oldest":
                filters.sortBy = "createdAt";
                filters.sortOrder = "asc";
                break;
            case "mostViews":
                filters.sortBy = "views";
                filters.sortOrder = "desc";
                break;
            case "mostReplies":
                filters.sortBy = "replyCount";
                filters.sortOrder = "desc";
                break;
            case "lastActivity":
                filters.sortBy = "lastActivity";
                filters.sortOrder = "desc";
                break;
        }

        // Apply filters
        switch (filterBy) {
            case "recent":
                filters.filter = "recent";
                filters.timeFrame = "week";
                break;
            case "unanswered":
                filters.filter = "unanswered";
                break;
            case "pinned":
                filters.filter = "pinned";
                break;
            case "popular":
                // For popular, we'll filter client-side
                break;
        }

        return filters;
    };

    const {
        data: threadsData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading: threadsLoading,
        isError: threadsError,
    } = useFetchThreads(getThreadFilters() as FetchThreadsOptions);

    // Get all threads from all pages
    const allThreads = useMemo(() => {
        if (!threadsData) return [];
        return threadsData.pages.flatMap((page) => page.threads);
    }, [threadsData]);

    // Apply client-side filters and search
    const filteredThreads = useMemo(() => {
        let threads = allThreads;

        // Apply popular filter client-side
        if (filterBy === "popular") {
            threads = threads.filter(
                (thread) => (thread.views || 0) > 50 || (thread.replyCount || 0) > 5
            );
        }

        // Apply search filter
        if (searchQuery) {
            threads = threads.filter(
                (thread) =>
                    thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    thread.content.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        return threads;
    }, [allThreads, filterBy, searchQuery]);

    // Statistics calculations
    const stats = useMemo(() => {
        const totalThreads = allThreads.length;
        const totalViews = allThreads.reduce(
            (sum, thread) => sum + (thread.views || 0),
            0
        );
        const totalRepliesReceived = allThreads.reduce(
            (sum, thread) => sum + (thread.replyCount || 0),
            0
        );
        const pinnedThreads = allThreads.filter((thread) => thread.isPinned).length;
        const lockedThreads = allThreads.filter((thread) => thread.isLocked).length;

        return {
            totalThreads,
            totalViews,
            totalRepliesReceived,
            pinnedThreads,
            lockedThreads,
            avgViewsPerThread:
                totalThreads > 0 ? Math.round(totalViews / totalThreads) : 0,
            avgRepliesPerThread:
                totalThreads > 0 ? Math.round(totalRepliesReceived / totalThreads) : 0,
        };
    }, [allThreads]);

    if (!currentUser) {
        return (
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="text-center space-y-4">
                    <h1 className="text-3xl font-bold text-[var(--txt-primary)]">
                        My Threads
                    </h1>
                    <p className="text-[var(--txt-secondary)]">
                        Please log in to view your threads.
                    </p>
                    <Link
                        to={FORUM_HOME_PATH}
                        className="inline-block px-6 py-3 bg-[var(--accent)] text-[var(--txt-highlight)] rounded-lg hover:bg-[var(--accent-hover)] transition-colors"
                    >
                        Back to Forum
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold text-[var(--txt-primary)]">
                    My Threads
                </h1>
                <p className="text-lg text-[var(--txt-secondary)] max-w-2xl mx-auto leading-relaxed">
                    Manage and track your forum contributions, engagement, and community
                    impact.
                </p>
            </div>

            {/* Statistics Dashboard */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="p-6 border border-[var(--br-secondary)] rounded-xl bg-[var(--bg-tertiary)] text-center">
                    <div className="text-2xl font-bold text-[var(--txt-primary)] mb-2">
                        {stats.totalThreads}
                    </div>
                    <div className="text-sm text-[var(--txt-secondary)]">
                        Total Threads
                    </div>
                </div>
                <div className="p-6 border border-[var(--br-secondary)] rounded-xl bg-[var(--bg-tertiary)] text-center">
                    <div className="text-2xl font-bold text-[var(--txt-primary)] mb-2">
                        {stats.totalViews}
                    </div>
                    <div className="text-sm text-[var(--txt-secondary)]">Total Views</div>
                </div>
                <div className="p-6 border border-[var(--br-secondary)] rounded-xl bg-[var(--bg-tertiary)] text-center">
                    <div className="text-2xl font-bold text-[var(--txt-primary)] mb-2">
                        {stats.totalRepliesReceived}
                    </div>
                    <div className="text-sm text-[var(--txt-secondary)]">
                        Replies Received
                    </div>
                </div>
                <div className="p-6 border border-[var(--br-secondary)] rounded-xl bg-[var(--bg-tertiary)] text-center">
                    <div className="text-2xl font-bold text-[var(--txt-primary)] mb-2">
                        {stats.avgViewsPerThread}
                    </div>
                    <div className="text-sm text-[var(--txt-secondary)]">
                        Avg Views/Thread
                    </div>
                </div>
            </div>

            {/* Advanced Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 border border-[var(--br-secondary)] rounded-xl">
                    <div className="flex items-center gap-3 mb-4">
                        <FaChartLine className="text-[var(--txt-secondary)]" size={20} />
                        <h3 className="font-semibold text-[var(--txt-primary)]">
                            Engagement Metrics
                        </h3>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-sm text-[var(--txt-secondary)]">
                                Avg Views/Thread
                            </span>
                            <span className="font-semibold text-[var(--txt-primary)]">
                                {stats.avgViewsPerThread}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-[var(--txt-secondary)]">
                                Avg Replies/Thread
                            </span>
                            <span className="font-semibold text-[var(--txt-primary)]">
                                {stats.avgRepliesPerThread}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="p-6 border border-[var(--br-secondary)] rounded-xl">
                    <div className="flex items-center gap-3 mb-4">
                        <FaThumbtack className="text-[var(--txt-secondary)]" size={20} />
                        <h3 className="font-semibold text-[var(--txt-primary)]">
                            Thread Status
                        </h3>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-sm text-[var(--txt-secondary)]">
                                Pinned Threads
                            </span>
                            <span className="font-semibold text-[var(--txt-primary)]">
                                {stats.pinnedThreads}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-[var(--txt-secondary)]">
                                Locked Threads
                            </span>
                            <span className="font-semibold text-[var(--txt-primary)]">
                                {stats.lockedThreads}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="p-6 border border-[var(--br-secondary)] rounded-xl">
                    <div className="flex items-center gap-3 mb-4">
                        <FaStar className="text-[var(--txt-secondary)]" size={20} />
                        <h3 className="font-semibold text-[var(--txt-primary)]">
                            Activity Summary
                        </h3>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-sm text-[var(--txt-secondary)]">
                                This Week
                            </span>
                            <span className="font-semibold text-[var(--txt-primary)]">
                                {
                                    allThreads.filter((thread) => {
                                        const daysSinceCreated =
                                            (Date.now() -
                                                new Date(thread.createdAt).getTime()) /
                                            (1000 * 60 * 60 * 24);
                                        return daysSinceCreated <= 7;
                                    }).length
                                }
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-[var(--txt-secondary)]">
                                This Month
                            </span>
                            <span className="font-semibold text-[var(--txt-primary)]">
                                {
                                    allThreads.filter((thread) => {
                                        const daysSinceCreated =
                                            (Date.now() -
                                                new Date(thread.createdAt).getTime()) /
                                            (1000 * 60 * 60 * 24);
                                        return daysSinceCreated <= 30;
                                    }).length
                                }
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Search */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search your threads..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-[var(--br-secondary)] rounded-lg bg-[var(--bg-surface)] text-[var(--txt-primary)] focus:outline-none focus:border-[var(--br-primary)]"
                        />
                        <FaFilter
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--txt-secondary)]"
                            size={14}
                        />
                    </div>

                    {/* Filter */}
                    <select
                        value={filterBy}
                        onChange={(e) => setFilterBy(e.target.value as FilterOption)}
                        className="px-4 py-2 border border-[var(--br-secondary)] rounded-lg bg-[var(--bg-surface)] text-[var(--txt-primary)] focus:outline-none focus:border-[var(--br-primary)]"
                    >
                        <option value="all">All Threads</option>
                        <option value="recent">Recent (7 days)</option>
                        <option value="popular">Popular</option>
                        <option value="unanswered">Unanswered</option>
                        <option value="pinned">Pinned</option>
                    </select>

                    {/* Sort */}
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                        className="px-4 py-2 border border-[var(--br-secondary)] rounded-lg bg-[var(--bg-surface)] text-[var(--txt-primary)] focus:outline-none focus:border-[var(--br-primary)]"
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="mostViews">Most Views</option>
                        <option value="mostReplies">Most Replies</option>
                        <option value="lastActivity">Last Activity</option>
                    </select>
                </div>

                <div className="text-sm text-[var(--txt-secondary)]">
                    {filteredThreads.length} of {allThreads.length} threads
                </div>
            </div>

            {/* Threads List */}
            <div className="space-y-4">
                {threadsLoading ? (
                    // Loading skeletons
                    [...Array(3)].map((_, i) => (
                        <div
                            key={i}
                            className="p-6 border border-[var(--br-secondary)] rounded-xl"
                        >
                            <Skeleton className="h-6 w-3/4 mb-3" />
                            <Skeleton className="h-4 w-full mb-2" />
                            <Skeleton className="h-4 w-2/3 mb-4" />
                            <div className="flex gap-4">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-16" />
                            </div>
                        </div>
                    ))
                ) : threadsError ? (
                    <div className="text-center py-12">
                        <div className="text-red-500 mb-4">Error loading threads</div>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-[var(--accent)] text-[var(--txt-highlight)] rounded-lg"
                        >
                            Retry
                        </button>
                    </div>
                ) : filteredThreads.length > 0 ? (
                    <>
                        {filteredThreads.map((thread: ForumThread) => (
                            <div
                                key={thread.id}
                                className="p-6 border border-[var(--br-secondary)] rounded-xl hover:border-[var(--br-primary)] transition-colors"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Link
                                                to={FORUM_PATHS.THREAD(thread.id)}
                                                className="text-lg font-semibold text-[var(--txt-primary)] hover:text-[var(--accent)] transition-colors"
                                            >
                                                {thread.title}
                                            </Link>
                                            {thread.isPinned && (
                                                <FaThumbtack
                                                    className="text-yellow-500"
                                                    size={14}
                                                />
                                            )}
                                            {thread.isLocked && (
                                                <FaLock
                                                    className="text-red-500"
                                                    size={14}
                                                />
                                            )}
                                        </div>

                                        <p className="text-[var(--txt-secondary)] mb-4 line-clamp-2">
                                            {thread.content}
                                        </p>

                                        <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--txt-secondary)]">
                                            <div className="flex items-center gap-1">
                                                <FaCalendar size={12} />
                                                <span>
                                                    {formatRelativeTime(thread.createdAt)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <FaEye size={12} />
                                                <span>{thread.views || 0} views</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <FaComment size={12} />
                                                <span>
                                                    {thread.replyCount || 0} replies
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span className="px-2 py-1 bg-[var(--bg-tertiary)] rounded-full text-xs">
                                                    {categories.find(
                                                        (cat) =>
                                                            cat.id === thread.categoryId
                                                    )?.name || "Category"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Link
                                            to={FORUM_PATHS.THREAD_EDIT(thread.id)}
                                            className="p-2 text-[var(--txt-secondary)] hover:text-[var(--accent)] hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors"
                                            title="Edit Thread"
                                        >
                                            <FaEdit size={14} />
                                        </Link>
                                        <button
                                            className="p-2 text-[var(--txt-secondary)] hover:text-red-500 hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors"
                                            title="Delete Thread"
                                        >
                                            <FaTrash size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Load more button */}
                        {hasNextPage && (
                            <div className="flex justify-center mt-6">
                                <button
                                    onClick={() => fetchNextPage()}
                                    disabled={isFetchingNextPage}
                                    className="px-6 py-3 bg-[var(--accent)] text-[var(--txt-highlight)] rounded-lg hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
                                >
                                    {isFetchingNextPage ? "Loading..." : "Load More"}
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">📝</div>
                        <h3 className="text-xl font-semibold text-[var(--txt-primary)] mb-2">
                            {searchQuery || filterBy !== "all"
                                ? "No threads found"
                                : "No threads yet"}
                        </h3>
                        <p className="text-[var(--txt-secondary)] mb-6">
                            {searchQuery || filterBy !== "all"
                                ? "Try adjusting your search or filter criteria."
                                : "Start your first discussion to see it here!"}
                        </p>
                        <Link
                            to={FORUM_PATHS.NEW_THREAD}
                            className="inline-block px-6 py-3 bg-[var(--accent)] text-[var(--txt-highlight)] rounded-lg hover:bg-[var(--accent-hover)] transition-colors"
                        >
                            Create Your First Thread
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};
