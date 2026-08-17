import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FaCalendar, FaEdit, FaEye, FaReply, FaTrash, FaUser } from "react-icons/fa";

import Skeleton from "@/features/shared/Skeleton";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useModal } from "@/features/shared/modal/hooks/useModal";
import { Spinner } from "@/features/shared/reusable/Spinner";

import { ReplyEditor } from "./ReplyEditor";
import { FORUM_PATHS } from "../constants/forumPaths";
import { formatRelativeTime } from "../utils/threadUtils";

import { FORUM_CATEGORIES } from "@/config/forumCategories";

import {
  useDeleteReply,
  useDeleteThread,
  useFetchCategories,
  useFetchReplies,
  useFetchThread,
  useIncrementThreadViews,
} from "../hooks";

export const ForumThread = () => {
  const navigate = useNavigate();

  const { threadId } = useParams();
  const { currentUser } = useAuth();
  const { open } = useModal("auth");

  const [isReplying, setIsReplying] = useState<boolean>(false);

  const { data: fetchedCategories = [] } = useFetchCategories();

  const {
    data: thread,
    isLoading: isThreadLoading,
    error: threadError,
  } = useFetchThread(threadId);

  const {
    data: repliesData,
    isLoading: areRepliesLoading,
    error: repliesError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFetchReplies(threadId);

  const {
    mutateAsync: deleteThread,
    isPending: isDeletingThread,
    error: deleteThreadError,
  } = useDeleteThread();

  const {
    mutateAsync: deleteReply,
    isPending: isDeletingReply,
    variables: deletingReply,
    error: deleteReplyError,
  } = useDeleteReply();

  const { mutate: incrementViews } = useIncrementThreadViews();

  const replies =
    repliesData?.pages.flatMap((page) => {
      return page.replies;
    }) ?? [];

  const categories = fetchedCategories.length > 0 ? fetchedCategories : FORUM_CATEGORIES;

  const loadedThreadId = thread?.id;

  useEffect(() => {
    if (!loadedThreadId) {
      return;
    }

    incrementViews(loadedThreadId);
  }, [loadedThreadId, incrementViews]);

  const handleThreadDelete = async (): Promise<void> => {
    if (!threadId || !thread) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this thread? This action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteThread(threadId);

      navigate(FORUM_PATHS.HOME);
    } catch {
      // Mutation error is rendered below.
    }
  };

  const handleLoadMoreReplies = () => {
    void fetchNextPage();
  };

  const handleReplyDelete = async (replyId: string): Promise<void> => {
    if (!threadId) {
      return;
    }

    const confirmed = window.confirm("Are you sure you want to delete this reply?");

    if (!confirmed) {
      return;
    }

    try {
      await deleteReply({
        replyId,
        threadId,
      });
    } catch {
      // Mutation error is rendered below.
    }
  };

  if (isThreadLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-surface-card text-txt-primary rounded-lg shadow p-6">
          <Skeleton className="h-8 w-3/4 mb-4" />
          <Skeleton className="h-5 w-full mb-2" />
          <Skeleton className="h-5 w-full mb-2" />
          <Skeleton className="h-5 w-3/4 mb-4" />

          <div className="flex gap-4 text-sm text-txt-muted">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>
    );
  }

  if (threadError) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg text-red-700 dark:text-red-400">
        <h2 className="text-lg font-semibold mb-2">Error Loading Thread</h2>

        <p>{threadError.message}</p>

        <Link
          to={FORUM_PATHS.HOME}
          className="mt-4 inline-block text-accent hover:underline"
        >
          Return to Forum
        </Link>
      </div>
    );
  }

  if (!threadId || !thread) {
    return (
      <div className="bg-surface-card text-txt-primary rounded-lg shadow p-6 text-center">
        <h2 className="text-xl font-semibold mb-4">Thread Not Found</h2>

        <p className="text-txt-secondary mb-6">
          The thread you&apos;re looking for may have been moved or deleted.
        </p>

        <Link
          to={FORUM_PATHS.HOME}
          className="inline-block px-4 py-2 rounded-lg font-semibold bg-accent text-txt-highlight hover:bg-accent-hover transition"
        >
          Return to Forum
        </Link>
      </div>
    );
  }

  // Thread display
  // Thread display
  return (
    <div className="space-y-6">
      {/* Thread metadata */}
      <div className="flex gap-2 text-sm text-txt-muted">
        <Link to={FORUM_PATHS.HOME} className="hover:text-accent">
          Forum
        </Link>

        <span>&gt;</span>

        <Link to={FORUM_PATHS.CATEGORY(thread.categoryId)} className="hover:text-accent">
          {categories.find((category) => {
            return category.id === thread.categoryId;
          })?.name ?? "Category"}
        </Link>
      </div>

      {/* Thread content */}
      <div className="bg-surface-card text-txt-primary rounded-lg shadow">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">
            {thread.title}

            {thread.isPinned && (
              <span className="ml-2 text-sm bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-2 py-1 rounded-full">
                Pinned
              </span>
            )}

            {thread.isLocked && (
              <span className="ml-2 text-sm bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-2 py-1 rounded-full">
                Locked
              </span>
            )}
          </h1>

          <div className="prose dark:prose-invert max-w-none mb-4">{thread.content}</div>

          <div className="flex flex-wrap items-center gap-x-4 text-sm text-txt-muted">
            <div className="flex items-center">
              <FaUser className="mr-1" size={12} />

              <span>{thread.authorName}</span>
            </div>

            <div className="flex items-center">
              <FaCalendar className="mr-1" size={12} />

              <span>Posted {formatRelativeTime(thread.createdAt)}</span>
            </div>

            <div className="flex items-center">
              <FaEye className="mr-1" size={12} />

              <span>{thread.views} views</span>
            </div>
          </div>
        </div>

        {deleteThreadError && (
          <div className="mx-6 mb-4 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
            {deleteThreadError.message}
          </div>
        )}

        {/* Thread actions */}
        <div className="px-6 py-3 border-t border-br-secondary flex flex-wrap gap-2 bg-muted">
          {currentUser && !thread.isLocked && (
            <button
              type="button"
              onClick={() => {
                setIsReplying(true);
              }}
              className="inline-flex items-center px-3 py-1.5 text-sm rounded-lg font-semibold bg-accent text-txt-highlight hover:bg-accent-hover transition"
            >
              <FaReply className="mr-1" size={12} />
              Reply
            </button>
          )}

          {!currentUser && !thread.isLocked && (
            <button
              type="button"
              onClick={() => {
                open({ mode: "login" });
              }}
              className="inline-flex items-center px-3 py-1.5 text-sm rounded-lg font-semibold bg-accent text-txt-highlight hover:bg-accent-hover transition"
            >
              <FaReply className="mr-1" size={12} />
              Sign in to Reply
            </button>
          )}

          {thread.isLocked && (
            <span className="text-sm text-txt-muted">
              This thread is locked, so new replies are closed.
            </span>
          )}

          {currentUser?.uid === thread.authorId && (
            <>
              <Link
                to={FORUM_PATHS.THREAD_EDIT(threadId)}
                className="inline-flex items-center px-3 py-1.5 text-sm rounded-lg font-semibold bg-surface-card text-txt-primary hover:bg-muted border border-br-secondary transition"
              >
                <FaEdit className="mr-1" size={12} />
                Edit
              </Link>

              <button
                type="button"
                onClick={handleThreadDelete}
                disabled={isDeletingThread}
                className="inline-flex items-center px-3 py-1.5 text-sm rounded-lg font-semibold bg-red-600 text-white hover:bg-red-700 transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FaTrash className="mr-1" size={12} />

                {isDeletingThread ? "Deleting..." : "Delete"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Reply form */}
      {isReplying && (
        <div className="bg-surface-card text-txt-primary rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4">Post a Reply</h3>

          <ReplyEditor
            threadId={threadId}
            onSuccess={() => {
              setIsReplying(false);
            }}
            onCancel={() => {
              setIsReplying(false);
            }}
          />
        </div>
      )}

      {/* Replies */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">{thread.replyCount} Replies</h2>

        {repliesError && (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">
            Error loading replies: {repliesError.message}
          </div>
        )}

        {deleteReplyError && (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">
            Unable to delete reply: {deleteReplyError.message}
          </div>
        )}

        {areRepliesLoading ? (
          <div className="space-y-4">
            {[0, 1].map((item) => {
              return (
                <div
                  key={item}
                  className="bg-surface-card text-txt-primary rounded-lg shadow p-6"
                >
                  <Skeleton className="h-5 w-full mb-2" />
                  <Skeleton className="h-5 w-2/3 mb-4" />
                  <Skeleton className="h-4 w-32" />
                </div>
              );
            })}
          </div>
        ) : replies.length > 0 ? (
          <div className="space-y-4">
            {replies.map((reply) => {
              const isDeletingThisReply =
                isDeletingReply && deletingReply?.replyId === reply.id;

              return (
                <div
                  key={reply.id}
                  className="bg-surface-card text-txt-primary rounded-lg shadow p-6"
                >
                  <div className="prose dark:prose-invert max-w-none mb-4">
                    {reply.content}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-y-2 text-sm text-txt-muted">
                    <div className="flex items-center gap-x-4">
                      <div className="flex items-center">
                        <FaUser className="mr-1" size={12} />

                        <span>{reply.authorName}</span>
                      </div>

                      <div className="flex items-center">
                        <FaCalendar className="mr-1" size={12} />

                        <span>
                          {reply.isEdited && reply.updatedAt
                            ? `Edited ${formatRelativeTime(reply.updatedAt)}`
                            : `Posted ${formatRelativeTime(reply.createdAt)}`}
                        </span>
                      </div>
                    </div>

                    {currentUser?.uid === reply.authorId && (
                      <div className="flex gap-2">
                        <Link
                          to={FORUM_PATHS.REPLY_EDIT(reply.id)}
                          className="inline-flex items-center text-xs px-2 py-1 rounded bg-surface-card text-txt-primary hover:bg-muted border border-br-secondary transition"
                        >
                          <FaEdit className="mr-1" size={10} />
                          Edit
                        </Link>

                        <button
                          type="button"
                          onClick={() => {
                            void handleReplyDelete(reply.id);
                          }}
                          disabled={isDeletingThisReply}
                          className="inline-flex items-center text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <FaTrash className="mr-1" size={10} />

                          {isDeletingThisReply ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {hasNextPage && (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleLoadMoreReplies}
                  disabled={isFetchingNextPage}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition"
                >
                  {isFetchingNextPage ? <Spinner size={12} /> : "Load More Replies"}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-surface-card text-txt-primary rounded-lg shadow p-6">
            <h3 className="font-semibold mb-2">No replies yet</h3>

            <p className="text-txt-muted mb-4">
              {thread.isLocked
                ? "This thread is locked and no longer accepts replies."
                : "Add the first response if you can answer the question or move the discussion forward."}
            </p>

            {!thread.isLocked && (
              <button
                type="button"
                onClick={() => {
                  if (!currentUser) {
                    open({ mode: "login" });
                    return;
                  }

                  setIsReplying(true);
                }}
                className="px-4 py-2 rounded-lg bg-accent text-txt-highlight hover:bg-accent-hover"
              >
                {currentUser ? "Post Reply" : "Sign in to Reply"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
