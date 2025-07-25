import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useForum } from "@/features/forum/hooks/useForum";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { FaEdit, FaTrash, FaReply, FaEye, FaCalendar, FaUser } from "react-icons/fa";
import Skeleton from "@/features/shared/Skeleton";
import { ReplyEditor } from "./ReplyEditor";
import { Spinner } from "@/features/shared/reusable/Spinner";
import { formatRelativeTime } from "@/features/forum/utils/threadUtils";
import { FORUM_PATHS, FORUM_HOME_PATH } from "@/features/forum/constants/forumPaths";
import type { FC } from "react";

export const ForumThread: FC = () => {
    const { threadId } = useParams<Record<string, string | undefined>>();
    const navigate = useNavigate();

    const { currentUser } = useAuth();
    const {
        loadThread,
        loadMoreReplies,
        currentThread,
        categories,
        deleteThread,
        pagination,
        loading,
        error,
        deleteReply,
    } = useForum();

    const [isReplying, setIsReplying] = useState<boolean>(false);
    const [loadingMore, setLoadingMore] = useState<boolean>(false);
    const [deletingReplyId, setDeletingReplyId] = useState<string | null>(null);

    useEffect(() => {
        if (threadId) {
            loadThread(threadId);
        }
    }, [threadId, loadThread]);

    const handleThreadDelete = async () => {
        if (!currentThread) return;

        if (
            window.confirm(
                "Are you sure you want to delete this thread? This action cannot be undone."
            )
        ) {
            try {
                await deleteThread(threadId as string);
                navigate(FORUM_HOME_PATH);
            } catch (error) {
                console.error("Error deleting thread:", error);
            }
        }
    };

    const handleLoadMoreReplies = async () => {
        if (!threadId) return;

        setLoadingMore(true);
        try {
            await loadMoreReplies(threadId);
        } catch (error) {
            console.error("Error loading more replies:", error);
        } finally {
            setLoadingMore(false);
        }
    };

    const handleReplyDelete = async (replyId: string, threadId: string) => {
        if (!window.confirm("Are you sure you want to delete this reply?")) return;
        setDeletingReplyId(replyId);
        try {
            await deleteReply(replyId, threadId);
            // Optionally show a toast or update UI
        } catch (err) {
            console.error("Error deleting reply:", err);
        } finally {
            setDeletingReplyId(null);
        }
    };

    // Loading state
    if (loading && !currentThread) {
        return (
            <div className="space-y-6">
                <div className="bg-[var(--bg-surface)] text-[var(--txt-primary)] rounded-lg shadow p-6">
                    <Skeleton className="h-8 w-3/4 mb-4" />
                    <Skeleton className="h-5 w-full mb-2" />
                    <Skeleton className="h-5 w-full mb-2" />
                    <Skeleton className="h-5 w-3/4 mb-4" />
                    <div className="flex gap-4 text-sm text-[var(--txt-muted)]">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                </div>

                {[...Array(2)].map((_, i) => (
                    <div
                        key={i}
                        className="bg-[var(--bg-surface)] text-[var(--txt-primary)] rounded-lg shadow p-6"
                    >
                        <Skeleton className="h-5 w-full mb-2" />
                        <Skeleton className="h-5 w-full mb-2" />
                        <Skeleton className="h-5 w-2/3 mb-4" />
                        <div className="flex gap-4 text-sm text-[var(--txt-muted)]">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg text-red-700 dark:text-red-400">
                <h2 className="text-lg font-semibold mb-2">Error Loading Thread</h2>
                <p>{error}</p>
                <Link
                    to={FORUM_HOME_PATH}
                    className="mt-4 inline-block text-[var(--accent)] hover:underline"
                >
                    Return to Forum
                </Link>
            </div>
        );
    }

    // No thread found
    if (!currentThread) {
        return (
            <div className="bg-[var(--bg-surface)] text-[var(--txt-primary)] rounded-lg shadow p-6 text-center">
                <h2 className="text-xl font-semibold mb-4">Thread Not Found</h2>
                <p className="text-[var(--txt-secondary)] mb-6">
                    The thread you&apos;re looking for may have been moved or deleted.
                </p>
                <Link
                    to={FORUM_HOME_PATH}
                    className="inline-block px-4 py-2 rounded-lg font-semibold bg-[var(--accent)] text-[var(--txt-highlight)] hover:bg-[var(--accent-hover)] transition"
                >
                    Return to Forum
                </Link>
            </div>
        );
    }

    // Thread display
    return (
        <div className="space-y-6">
            {/* Thread metadata */}
            <div className="flex gap-2 text-sm text-[var(--txt-muted)]">
                <Link to={FORUM_HOME_PATH} className="hover:text-[var(--accent)]">
                    Forum
                </Link>
                <span>&gt;</span>
                <Link
                    to={FORUM_PATHS.CATEGORY(currentThread.categoryId)}
                    className="hover:text-[var(--accent)]"
                >
                    {categories.find((cat) => cat.id === currentThread.categoryId)
                        ?.name || "Category"}
                </Link>
            </div>

            {/* Thread content */}
            <div className="bg-[var(--bg-surface)] text-[var(--txt-primary)] rounded-lg shadow">
                <div className="p-6">
                    <h1 className="text-2xl font-bold mb-4">
                        {currentThread.title}
                        {currentThread.isPinned && (
                            <span className="ml-2 text-sm bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-2 py-1 rounded-full">
                                Pinned
                            </span>
                        )}
                        {currentThread.isLocked && (
                            <span className="ml-2 text-sm bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-2 py-1 rounded-full">
                                Locked
                            </span>
                        )}
                    </h1>

                    <div className="prose dark:prose-invert max-w-none mb-4">
                        {currentThread.content}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 text-sm text-[var(--txt-muted)]">
                        <div className="flex items-center">
                            <FaUser className="mr-1" size={12} />
                            <span>{currentThread.authorName}</span>
                        </div>

                        <div className="flex items-center">
                            <FaCalendar className="mr-1" size={12} />
                            <span>
                                Posted {formatRelativeTime(currentThread.createdAt)}
                            </span>
                        </div>

                        <div className="flex items-center">
                            <FaEye className="mr-1" size={12} />
                            <span>{currentThread.views || 0} views</span>
                        </div>
                    </div>
                </div>

                {/* Thread actions */}
                <div className="px-6 py-3 border-t border-[var(--br-secondary)] flex flex-wrap gap-2 bg-[var(--bg-tertiary)]">
                    {currentUser && !currentThread.isLocked && (
                        <button
                            onClick={() => setIsReplying(true)}
                            className="inline-flex items-center px-3 py-1.5 text-sm rounded-lg font-semibold bg-[var(--accent)] text-[var(--txt-highlight)] hover:bg-[var(--accent-hover)] transition"
                        >
                            <FaReply className="mr-1" size={12} />
                            Reply
                        </button>
                    )}

                    {currentUser?.uid === currentThread.authorId && (
                        <>
                            <Link
                                to={FORUM_PATHS.THREAD_EDIT(threadId as string)}
                                className="inline-flex items-center px-3 py-1.5 text-sm rounded-lg font-semibold bg-[var(--bg-surface)] text-[var(--txt-primary)] hover:bg-[var(--bg-tertiary)] border border-[var(--br-secondary)] transition"
                            >
                                <FaEdit className="mr-1" size={12} />
                                Edit
                            </Link>

                            <button
                                onClick={handleThreadDelete}
                                className="inline-flex items-center px-3 py-1.5 text-sm rounded-lg font-semibold bg-red-600 text-white hover:bg-red-700 transition"
                            >
                                <FaTrash className="mr-1" size={12} />
                                Delete
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Reply form */}
            {isReplying && (
                <div className="bg-[var(--bg-surface)] text-[var(--txt-primary)] rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium mb-4">Post a Reply</h3>
                    <ReplyEditor
                        threadId={threadId ?? ""}
                        onSuccess={() => setIsReplying(false)}
                        onCancel={() => setIsReplying(false)}
                    />
                </div>
            )}

            {/* Replies */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">
                    {currentThread.replyCount || 0} Replies
                </h2>

                {Array.isArray(currentThread.replies) &&
                currentThread.replies.length > 0 ? (
                    <div className="space-y-4">
                        {currentThread.replies.map((reply) => (
                            <div
                                key={reply.id}
                                className="bg-[var(--bg-surface)] text-[var(--txt-primary)] rounded-lg shadow p-6"
                            >
                                <div className="prose dark:prose-invert max-w-none mb-4">
                                    {reply.content}
                                </div>

                                <div className="flex flex-wrap items-center justify-between gap-y-2 text-sm text-[var(--txt-muted)]">
                                    <div className="flex items-center gap-x-4">
                                        <div className="flex items-center">
                                            <FaUser className="mr-1" size={12} />
                                            <span>{reply.authorName}</span>
                                        </div>

                                        <div className="flex items-center">
                                            <FaCalendar className="mr-1" size={12} />
                                            <span>
                                                {reply.isEdited
                                                    ? `Edited ${formatRelativeTime(
                                                          reply.updatedAt
                                                      )}`
                                                    : `Posted ${formatRelativeTime(
                                                          reply.createdAt
                                                      )}`}
                                            </span>
                                        </div>
                                    </div>

                                    {currentUser?.uid === reply.authorId && (
                                        <div className="flex gap-2">
                                            <Link
                                                to={`/forum/reply/${reply.id}/edit`}
                                                className="inline-flex items-center text-xs px-2 py-1 rounded bg-[var(--bg-surface)] text-[var(--txt-primary)] hover:bg-[var(--bg-tertiary)] border border-[var(--br-secondary)] transition"
                                            >
                                                <FaEdit className="mr-1" size={10} />
                                                Edit
                                            </Link>

                                            <button
                                                className="inline-flex items-center text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
                                                onClick={() =>
                                                    handleReplyDelete(
                                                        reply.id,
                                                        currentThread.id
                                                    )
                                                }
                                                disabled={deletingReplyId === reply.id}
                                                aria-disabled={
                                                    deletingReplyId === reply.id
                                                }
                                            >
                                                <FaTrash className="mr-1" size={10} />
                                                {deletingReplyId === reply.id
                                                    ? "Deleting..."
                                                    : "Delete"}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {pagination.replies.hasMore && (
                            <div className="flex justify-center">
                                <button
                                    onClick={handleLoadMoreReplies}
                                    disabled={loadingMore}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition"
                                >
                                    {loadingMore ? (
                                        <Spinner size={12} />
                                    ) : (
                                        "Load More Replies"
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
                        <p className="text-gray-500 dark:text-gray-400">
                            No replies yet. Be the first to respond!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
