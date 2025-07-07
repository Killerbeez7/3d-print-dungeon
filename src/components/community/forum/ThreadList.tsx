import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useForum } from "@/hooks/useForum";
import { formatDistanceToNow } from "date-fns";
import { FaComment, FaEye, FaTag, FaUser, FaCalendar } from "react-icons/fa";
import Skeleton from "@/components/shared/Skeleton";
import { Spinner } from "@/components/shared/Spinner";
import type { ForumThread } from "@/types/forum";

export interface ThreadListProps {
    categoryId: string;
    sortBy?: string;
    showCategory?: boolean;
    isCompact?: boolean;
}

type ThreadWithCategoryName = ForumThread & { categoryName?: string };

export function ThreadList({
    categoryId,
    sortBy = "lastActivity",
    showCategory = false,
    isCompact = false,
}: ThreadListProps) {
    const { getThreadsByCategory, loadMoreThreads, threads, pagination, loading, error } =
        useForum();

    const [localThreads, setLocalThreads] = useState<ForumThread[]>([]);
    const [loadingMore, setLoadingMore] = useState<boolean>(false);

    useEffect(() => {
        const fetchThreads = async () => {
            try {
                await getThreadsByCategory(categoryId, sortBy);
            } catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                console.error("Error fetching threads:", msg);
            }
        };
        fetchThreads();
    }, [categoryId, sortBy, getThreadsByCategory]);

    useEffect(() => {
        if (categoryId && threads.byCategory && threads.byCategory[categoryId]) {
            setLocalThreads(threads.byCategory[categoryId]);
        }
    }, [categoryId, threads.byCategory]);

    const handleLoadMore = async () => {
        setLoadingMore(true);
        try {
            await loadMoreThreads(categoryId, sortBy);
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            console.error("Error loading more threads:", msg);
        } finally {
            setLoadingMore(false);
        }
    };

    const formatDate = (timestamp: unknown): string => {
        if (!timestamp) return "Unknown date";
        const ts = timestamp as { toDate?: () => Date } | Date;
        const date =
            typeof ts === "object" &&
            typeof (ts as { toDate?: () => Date }).toDate === "function"
                ? (ts as { toDate: () => Date }).toDate()
                : new Date(ts as string | number | Date);
        return formatDistanceToNow(date, { addSuffix: true });
    };

    if (loading && !loadingMore) {
        return (
            <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                    <div
                        key={i}
                        className="bg-[var(--bg-surface)] text-[var(--txt-primary)] rounded-lg shadow p-4"
                    >
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
                Error loading threads: {error}
            </div>
        );
    }

    if (!localThreads || localThreads.length === 0) {
        return (
            <div className="bg-[var(--bg-surface)] text-[var(--txt-primary)] rounded-lg shadow p-6 text-center">
                <p className="text-[var(--txt-muted)]">
                    No threads found in this category. Be the first to start a discussion!
                </p>
                <Link
                    to="/forum/new-thread"
                    className="inline-block mt-4 px-4 py-2 rounded-lg font-semibold bg-[var(--accent)] text-[var(--txt-highlight)] hover:bg-[var(--accent-hover)] transition"
                >
                    Create New Thread
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {(localThreads as ThreadWithCategoryName[]).map((thread) => (
                <div
                    key={thread.id}
                    className={`bg-[var(--bg-surface)] text-[var(--txt-primary)] rounded-lg shadow ${
                        thread.isPinned ? "border-l-4 border-yellow-400" : ""
                    } ${isCompact ? "p-3" : "p-4"}`}
                >
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <Link
                                to={`/forum/thread/${thread.id}`}
                                className="text-lg font-medium hover:text-[var(--accent)] transition"
                            >
                                {thread.title}
                            </Link>
                            {!isCompact && thread.tags && thread.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {thread.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="inline-flex items-center px-2 py-1 text-xs bg-[var(--bg-tertiary)] text-[var(--txt-primary)] rounded-full"
                                        >
                                            <FaTag
                                                className="mr-1 text-[var(--txt-muted)]"
                                                size={10}
                                            />
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                        {thread.isLocked && (
                            <span className="inline-flex items-center px-2 py-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full ml-2">
                                Locked
                            </span>
                        )}
                    </div>
                    <div
                        className={`flex flex-wrap ${
                            isCompact ? "mt-1" : "mt-2"
                        } gap-x-4 text-sm text-[var(--txt-muted)]`}
                    >
                        <span className="inline-flex items-center">
                            <FaUser className="mr-1" size={12} />
                            {thread.authorName}
                        </span>
                        <span className="inline-flex items-center">
                            <FaComment className="mr-1" size={12} />
                            {thread.replyCount || 0} replies
                        </span>
                        <span className="inline-flex items-center">
                            <FaEye className="mr-1" size={12} />
                            {thread.views || 0} views
                        </span>
                        <span className="inline-flex items-center">
                            <FaCalendar className="mr-1" size={12} />
                            {formatDate(thread.lastActivity || thread.createdAt)}
                        </span>
                        {showCategory && (
                            <span className="inline-flex items-center ml-auto text-blue-600 dark:text-blue-400">
                                <Link to={`/forum/category/${thread.categoryId}`}>
                                    {thread.categoryName ?? "Category"}
                                </Link>
                            </span>
                        )}
                    </div>
                </div>
            ))}
            {pagination.threads.hasMore && (
                <div className="flex justify-center mt-4">
                    <button
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        className="px-4 py-2 rounded-lg font-semibold bg-[var(--accent)] text-[var(--txt-highlight)] hover:bg-[var(--accent-hover)] disabled:bg-[var(--accent-hover)] disabled:cursor-not-allowed transition"
                    >
                        {loadingMore ? <Spinner size={12} /> : "Load More"}
                    </button>
                </div>
            )}
        </div>
    );
}
