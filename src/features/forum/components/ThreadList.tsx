import { FC } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useModal } from "@/hooks/useModal";
import { useFetchThreads, useFetchCategories } from "@/features/forum/hooks";
import { formatDistanceToNow } from "date-fns";
import { FaComment, FaEye, FaTag, FaUser, FaCalendar } from "react-icons/fa";
import Skeleton from "@/features/shared/Skeleton";
import { Spinner } from "@/features/shared/reusable/Spinner";
import type { ForumThread, ThreadListProps } from "@/features/forum/types/forum";




type ThreadWithCategoryName = ForumThread & { categoryName?: string };

export const ThreadList: FC<ThreadListProps> = ({
    categoryId,
    sortBy = "lastActivity" as const,
    showCategory = false,
    isCompact = false,
}: ThreadListProps) => {
    const { currentUser } = useAuth();
    const { open } = useModal("auth");
    const navigate = useNavigate();
    const { data: categories = [] } = useFetchCategories();
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        error,
    } = useFetchThreads({
        categoryId,
        sortBy: sortBy as "lastActivity" | "createdAt" | "views" | "replyCount",
        sortOrder: "desc",
    });

    const localThreads = data?.pages.flatMap((page) => page.threads) ?? [];

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

    if (isLoading) {
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
                Error loading threads: {error.message}
            </div>
        );
    }

    if (!localThreads || localThreads.length === 0) {
        return (
            <div className="bg-[var(--bg-surface)] text-[var(--txt-primary)] rounded-lg shadow p-6">
                <h3 className="font-semibold mb-2">No threads in this category</h3>
                <p className="text-[var(--txt-muted)] mb-4">
                    This category is ready for focused discussion. Start the first thread
                    here or browse another category from the sidebar.
                </p>
                <button
                    type="button"
                    onClick={() => {
                        if (!currentUser) {
                            open({ mode: "login" });
                            return;
                        }
                        navigate(`/forum/new-thread?category=${categoryId}`);
                    }}
                    className="inline-block px-4 py-2 rounded-lg font-semibold bg-[var(--accent)] text-[var(--txt-highlight)] hover:bg-[var(--accent-hover)] transition"
                >
                    Create Thread in This Category
                </button>
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
                                    {thread.categoryName ??
                                        categories.find(
                                            (category) => category.id === thread.categoryId
                                        )?.name ??
                                        "Category"}
                                </Link>
                            </span>
                        )}
                    </div>
                </div>
            ))}
            {hasNextPage && (
                <div className="flex justify-center mt-4">
                    <button
                        onClick={() => fetchNextPage()}
                        disabled={isFetchingNextPage}
                        className="px-4 py-2 rounded-lg font-semibold bg-[var(--accent)] text-[var(--txt-highlight)] hover:bg-[var(--accent-hover)] disabled:bg-[var(--accent-hover)] disabled:cursor-not-allowed transition"
                    >
                        {isFetchingNextPage ? <Spinner size={12} /> : "Load More"}
                    </button>
                </div>
            )}
        </div>
    );
}
