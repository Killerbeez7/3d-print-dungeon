import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  FaCalendar,
  FaEdit,
  FaEye,
  FaLock,
  FaReply,
  FaThumbtack,
  FaTrash,
  FaUser,
} from "react-icons/fa";

import { FORUM_CATEGORIES } from "@/config/forumCategories";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useModal } from "@/features/shared/modal/hooks/useModal";
import Skeleton from "@/features/shared/Skeleton";
import { Spinner } from "@/features/shared/reusable/Spinner";

import { ReplyEditor } from "./ReplyEditor";
import { FORUM_PATHS } from "../constants/forumPaths";
import { formatRelativeTime } from "../utils/threadUtils";

import {
  useDeleteReply,
  useDeleteThread,
  useFetchCategories,
  useFetchReplies,
  useFetchThread,
  useIncrementThreadViews,
} from "../hooks";

export function ForumThread() {
  const navigate = useNavigate();
  const { threadId } = useParams();

  const { currentUser } = useAuth();
  const { open } = useModal("auth");

  const [isReplying, setIsReplying] = useState(false);

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

  const handleLoadMoreReplies = (): void => {
    void fetchNextPage();
  };

  if (isThreadLoading) {
    return (
      <div className="space-y-5">
        <div className="rounded-xl border border-br-subtle bg-surface-card p-6 shadow-sm">
          <Skeleton className="mb-4 h-4 w-32" />
          <Skeleton className="mb-4 h-8 w-3/4" />
          <Skeleton className="mb-3 h-5 w-full" />
          <Skeleton className="mb-3 h-5 w-full" />
          <Skeleton className="mb-6 h-5 w-2/3" />

          <div className="flex gap-4">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </div>
    );
  }

  if (threadError) {
    return (
      <div className="rounded-xl border border-error/30 bg-error/10 p-6 text-error">
        <h2 className="mb-2 text-lg font-semibold">Error Loading Thread</h2>

        <p>{threadError.message}</p>

        <Link
          to={FORUM_PATHS.HOME}
          className="mt-4 inline-block font-medium text-accent hover:text-accent-hover"
        >
          Return to Forum
        </Link>
      </div>
    );
  }

  if (!threadId || !thread) {
    return (
      <div className="rounded-xl border border-br-subtle bg-surface-card p-8 text-center shadow-sm">
        <h2 className="mb-3 text-xl font-semibold text-txt-primary">Thread Not Found</h2>

        <p className="mb-6 text-txt-secondary">
          The thread you&apos;re looking for may have been moved or deleted.
        </p>

        <Link
          to={FORUM_PATHS.HOME}
          className="inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-btn-primary-text transition-colors hover:bg-accent-hover"
        >
          Return to Forum
        </Link>
      </div>
    );
  }

  const categoryName =
    categories.find((category) => {
      return category.id === thread.categoryId;
    })?.name ?? "Category";

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav
        className="flex flex-wrap items-center gap-2 text-sm text-txt-muted"
        aria-label="Breadcrumb"
      >
        <Link to={FORUM_PATHS.HOME} className="transition-colors hover:text-accent">
          Forum
        </Link>

        <span aria-hidden="true">/</span>

        <Link
          to={FORUM_PATHS.CATEGORY(thread.categoryId)}
          className="transition-colors hover:text-accent"
        >
          {categoryName}
        </Link>
      </nav>

      {/* Main thread */}
      <article className="overflow-hidden rounded-xl border border-br-subtle bg-surface-card shadow-sm">
        <div className="p-6 sm:p-7">
          {/* Status */}
          {(thread.isPinned || thread.isLocked) && (
            <div className="mb-4 flex flex-wrap gap-2">
              {thread.isPinned && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-warning/10 px-2.5 py-1 text-xs font-semibold text-warning">
                  <FaThumbtack size={9} aria-hidden="true" />
                  Pinned
                </span>
              )}

              {thread.isLocked && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-error/10 px-2.5 py-1 text-xs font-semibold text-error">
                  <FaLock size={9} aria-hidden="true" />
                  Locked
                </span>
              )}
            </div>
          )}

          <h1 className="text-2xl font-bold leading-tight text-txt-primary sm:text-3xl">
            {thread.title}
          </h1>

          {/* Metadata */}
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-txt-muted">
            <span className="inline-flex items-center">
              <FaUser className="mr-1.5" size={11} aria-hidden="true" />
              {thread.authorName}
            </span>

            <span className="inline-flex items-center">
              <FaCalendar className="mr-1.5" size={11} aria-hidden="true" />
              Posted {formatRelativeTime(thread.createdAt)}
            </span>

            <span className="inline-flex items-center">
              <FaEye className="mr-1.5" size={11} aria-hidden="true" />
              {thread.views} views
            </span>
          </div>

          {/* Content */}
          <div className="mt-7 whitespace-pre-wrap leading-7 text-txt-primary">
            {thread.content}
          </div>
        </div>

        {deleteThreadError && (
          <div className="mx-6 mb-4 rounded-lg border border-error/30 bg-error/10 p-3 text-sm text-error">
            {deleteThreadError.message}
          </div>
        )}

        {/* Thread actions */}
        <div className="flex flex-wrap items-center gap-2 border-t border-br-subtle bg-muted/50 px-6 py-3">
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
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-btn-primary-text transition-colors hover:bg-accent-hover"
            >
              <FaReply size={11} aria-hidden="true" />
              {currentUser ? "Reply" : "Sign in to Reply"}
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
                className="inline-flex items-center gap-2 rounded-lg border border-br-secondary bg-surface-card px-3.5 py-2 text-sm font-semibold text-txt-primary transition-colors hover:bg-muted"
              >
                <FaEdit size={11} aria-hidden="true" />
                Edit
              </Link>

              <button
                type="button"
                onClick={handleThreadDelete}
                disabled={isDeletingThread}
                className="inline-flex items-center gap-2 rounded-lg bg-error px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-error-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FaTrash size={11} aria-hidden="true" />
                {isDeletingThread ? "Deleting..." : "Delete"}
              </button>
            </>
          )}
        </div>
      </article>

      {/* Reply editor */}
      {isReplying && (
        <section className="rounded-xl border border-br-subtle bg-surface-card p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-txt-primary">Post a Reply</h2>

            <p className="mt-1 text-sm text-txt-muted">
              Add something useful to the discussion.
            </p>
          </div>

          <ReplyEditor
            threadId={threadId}
            onSuccess={() => {
              setIsReplying(false);
            }}
            onCancel={() => {
              setIsReplying(false);
            }}
          />
        </section>
      )}

      {/* Replies */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-txt-primary">Replies</h2>

          <span className="text-sm text-txt-muted">
            {thread.replyCount} {thread.replyCount === 1 ? "reply" : "replies"}
          </span>
        </div>

        {repliesError && (
          <div className="mb-4 rounded-lg border border-error/30 bg-error/10 p-4 text-sm text-error">
            Error loading replies: {repliesError.message}
          </div>
        )}

        {deleteReplyError && (
          <div className="mb-4 rounded-lg border border-error/30 bg-error/10 p-4 text-sm text-error">
            Unable to delete reply: {deleteReplyError.message}
          </div>
        )}

        {areRepliesLoading ? (
          <div className="overflow-hidden rounded-xl border border-br-subtle bg-surface-card shadow-sm">
            {[0, 1].map((item) => (
              <div key={item} className="border-b border-br-subtle p-6 last:border-b-0">
                <Skeleton className="mb-4 h-4 w-32" />
                <Skeleton className="mb-2 h-5 w-full" />
                <Skeleton className="h-5 w-2/3" />
              </div>
            ))}
          </div>
        ) : replies.length > 0 ? (
          <>
            <div className="overflow-hidden rounded-xl border border-br-subtle bg-surface-card shadow-sm">
              {replies.map((reply) => {
                const isDeletingThisReply =
                  isDeletingReply && deletingReply?.replyId === reply.id;

                return (
                  <article
                    key={reply.id}
                    className="border-b border-br-subtle p-5 last:border-b-0 sm:p-6"
                  >
                    {/* Author */}
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-txt-secondary">
                          <FaUser size={13} aria-hidden="true" />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-txt-primary">
                            {reply.authorName}
                          </p>

                          <p className="text-xs text-txt-muted">
                            {reply.isEdited && reply.updatedAt
                              ? `Edited ${formatRelativeTime(reply.updatedAt)}`
                              : `${formatRelativeTime(reply.createdAt)}`}
                          </p>
                        </div>
                      </div>

                      {currentUser?.uid === reply.authorId && (
                        <div className="flex shrink-0 items-center gap-1">
                          <Link
                            to={FORUM_PATHS.REPLY_EDIT(reply.id)}
                            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-txt-secondary transition-colors hover:bg-muted hover:text-txt-primary"
                          >
                            <FaEdit size={10} aria-hidden="true" />
                            Edit
                          </Link>

                          <button
                            type="button"
                            onClick={() => {
                              void handleReplyDelete(reply.id);
                            }}
                            disabled={isDeletingThisReply}
                            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-error transition-colors hover:bg-error/10 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <FaTrash size={10} aria-hidden="true" />
                            {isDeletingThisReply ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="whitespace-pre-wrap pl-12 leading-7 text-txt-primary">
                      {reply.content}
                    </div>
                  </article>
                );
              })}
            </div>

            {hasNextPage && (
              <div className="flex justify-center pt-5">
                <button
                  type="button"
                  onClick={handleLoadMoreReplies}
                  disabled={isFetchingNextPage}
                  className="min-w-36 rounded-lg border border-br-secondary bg-surface-card px-5 py-2.5 text-sm font-semibold text-txt-primary shadow-sm transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isFetchingNextPage ? <Spinner size={12} /> : "Load More Replies"}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-xl border border-br-subtle bg-surface-card p-8 text-center shadow-sm">
            <h3 className="mb-2 text-lg font-semibold text-txt-primary">
              No replies yet
            </h3>

            <p className="mx-auto mb-5 max-w-xl text-sm leading-relaxed text-txt-secondary">
              {thread.isLocked
                ? "This thread is locked and no longer accepts replies."
                : "Add the first response if you can answer the question or move the discussion forward."}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
