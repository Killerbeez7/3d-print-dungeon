import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Lock, MessageSquareOff, Pencil, Pin, Reply, Trash2 } from "lucide-react";

import { Button, buttonClassName } from "@/components";
import { StatePanel } from "@/features/shared/components/StatePanel";

import { FORUM_CATEGORIES } from "@/config/forumCategories";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useModal } from "@/features/shared/modal/hooks/useModal";

import { ReplyEditor } from "./ReplyEditor";
import { ForumAlert, ForumAvatar, ForumBadge } from "./ForumUI";
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
      <div className="space-y-5" role="status" aria-label="Loading thread">
        <div className="skeleton-print h-4 w-40" />
        <div className="rounded-xl border border-br-subtle bg-surface-card p-6">
          <div className="skeleton-print h-8 w-3/4" />
          <div className="skeleton-print mt-4 h-4 w-1/3" />
          <div className="mt-8 space-y-3">
            <div className="skeleton-print h-4 w-full" />
            <div className="skeleton-print h-4 w-full" />
            <div className="skeleton-print h-4 w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (threadError || !threadId || !thread) {
    return (
      <StatePanel
        icon={MessageSquareOff}
        title={threadError ? "Couldn't load this thread" : "Thread not found"}
        actions={
          <Link to={FORUM_PATHS.HOME} className={buttonClassName()}>
            Back to the forum
          </Link>
        }
      >
        {threadError
          ? "Check your connection and refresh the page."
          : "It may have been moved or deleted."}
      </StatePanel>
    );
  }

  const categoryName =
    categories.find((category) => category.id === thread.categoryId)?.name ?? "Category";
  const isAuthor = currentUser?.uid === thread.authorId;

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8">
      <nav aria-label="Breadcrumb" className="label-mono flex flex-wrap items-center gap-2 text-txt-muted">
        <Link to={FORUM_PATHS.HOME} className="transition-colors hover:text-accent">
          Forum
        </Link>
        <span aria-hidden="true">/</span>
        <Link to={FORUM_PATHS.CATEGORY(thread.categoryId)} className="transition-colors hover:text-accent">
          {categoryName}
        </Link>
      </nav>

      {/* Opening post */}
      <article className="overflow-hidden rounded-xl border border-br-subtle bg-surface-card">
        <div className="p-5 sm:p-7">
          {(thread.isPinned || thread.isLocked) && (
            <div className="mb-3 flex flex-wrap gap-2">
              {thread.isPinned && (
                <ForumBadge tone="warning">
                  <Pin className="size-3" aria-hidden="true" /> Pinned
                </ForumBadge>
              )}
              {thread.isLocked && (
                <ForumBadge tone="error">
                  <Lock className="size-3" aria-hidden="true" /> Locked
                </ForumBadge>
              )}
            </div>
          )}

          <h1 className="text-2xl font-bold leading-tight sm:text-3xl">{thread.title}</h1>

          <div className="mt-5 flex items-center gap-3">
            <ForumAvatar src={thread.authorPhotoURL} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-txt-primary">{thread.authorName}</p>
              <p className="font-mono text-xs text-txt-muted">
                {formatRelativeTime(thread.createdAt)} · {thread.views} views
              </p>
            </div>
          </div>

          <div className="mt-6 whitespace-pre-wrap text-base leading-7 text-txt-primary">
            {thread.content}
          </div>
        </div>

        {deleteThreadError && (
          <div className="px-5 pb-4 sm:px-7">
            <ForumAlert>{deleteThreadError.message}</ForumAlert>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 border-t border-br-subtle bg-section px-5 py-3 sm:px-7">
          {thread.isLocked ? (
            <span className="flex items-center gap-2 text-sm text-txt-muted">
              <Lock className="size-4" aria-hidden="true" />
              This thread is locked, so new replies are closed.
            </span>
          ) : (
            <Button
              size="sm"
              onClick={() => {
                if (!currentUser) {
                  open({ mode: "login" });
                  return;
                }
                setIsReplying(true);
              }}
              leftIcon={<Reply className="size-4" aria-hidden="true" />}
            >
              {currentUser ? "Reply" : "Sign in to reply"}
            </Button>
          )}

          {isAuthor && (
            <div className="ml-auto flex gap-1">
              <Link
                to={FORUM_PATHS.THREAD_EDIT(threadId)}
                className={buttonClassName({ variant: "ghost", size: "sm" })}
              >
                <Pencil className="size-4" aria-hidden="true" />
                Edit
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleThreadDelete}
                disabled={isDeletingThread}
                className="text-error"
                leftIcon={<Trash2 className="size-4" aria-hidden="true" />}
              >
                {isDeletingThread ? "Deleting…" : "Delete"}
              </Button>
            </div>
          )}
        </div>
      </article>

      {isReplying && (
        <section className="rounded-xl border border-accent/50 bg-surface-card p-5 sm:p-6" aria-label="Write a reply">
          <h2 className="mb-4 text-lg font-bold">Your reply</h2>
          <ReplyEditor
            threadId={threadId}
            onSuccess={() => setIsReplying(false)}
            onCancel={() => setIsReplying(false)}
          />
        </section>
      )}

      {/* Replies */}
      <section aria-labelledby="replies-heading">
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <h2 id="replies-heading" className="text-xl font-bold">
            Replies
          </h2>
          <span className="font-mono text-sm text-txt-muted">{thread.replyCount}</span>
        </div>

        <div className="space-y-3">
          {repliesError && <ForumAlert>Replies couldn&apos;t load. Refresh to try again.</ForumAlert>}
          {deleteReplyError && <ForumAlert>Couldn&apos;t delete that reply: {deleteReplyError.message}</ForumAlert>}
        </div>

        {areRepliesLoading ? (
          <div className="space-y-4" role="status" aria-label="Loading replies">
            {[0, 1].map((item) => (
              <div key={item} className="flex gap-3">
                <div className="skeleton-print chamfer size-9 [--cut:7px]" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton-print h-3 w-32" />
                  <div className="skeleton-print h-4 w-full" />
                  <div className="skeleton-print h-4 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : replies.length > 0 ? (
          <>
            {/* Timeline: a print-layer line links the replies */}
            <ol className="relative space-y-1 before:absolute before:bottom-6 before:left-[17px] before:top-6 before:w-px before:bg-br-subtle">
              {replies.map((reply) => {
                const isDeletingThisReply = isDeletingReply && deletingReply?.replyId === reply.id;
                const isReplyAuthor = currentUser?.uid === reply.authorId;

                return (
                  <li key={reply.id} className="group relative flex gap-3 rounded-lg py-3 pr-2">
                    <ForumAvatar src={reply.authorPhotoURL} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="text-sm font-semibold text-txt-primary">{reply.authorName}</span>
                        {reply.authorId === thread.authorId && <ForumBadge tone="accent">OP</ForumBadge>}
                        <span className="font-mono text-xs text-txt-muted">
                          {reply.isEdited && reply.updatedAt
                            ? `edited ${formatRelativeTime(reply.updatedAt)}`
                            : formatRelativeTime(reply.createdAt)}
                        </span>
                        {isReplyAuthor && (
                          <span className="ml-auto flex gap-1 transition-opacity [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-focus-within:opacity-100 [@media(hover:hover)]:group-hover:opacity-100">
                            <Link
                              to={FORUM_PATHS.REPLY_EDIT(reply.id)}
                              aria-label="Edit reply"
                              className="flex size-8 items-center justify-center rounded-md text-txt-muted transition-colors hover:bg-muted hover:text-txt-primary"
                            >
                              <Pencil className="size-3.5" aria-hidden="true" />
                            </Link>
                            <button
                              type="button"
                              onClick={() => void handleReplyDelete(reply.id)}
                              disabled={isDeletingThisReply}
                              aria-label="Delete reply"
                              className="flex size-8 items-center justify-center rounded-md text-txt-muted transition-colors hover:bg-error/10 hover:text-error disabled:opacity-50"
                            >
                              <Trash2 className="size-3.5" aria-hidden="true" />
                            </button>
                          </span>
                        )}
                      </div>
                      <div className="mt-1.5 whitespace-pre-wrap text-[0.95rem] leading-7 text-txt-primary">
                        {reply.content}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>

            {hasNextPage && (
              <div className="flex justify-center pt-5">
                <Button variant="secondary" onClick={handleLoadMoreReplies} isLoading={isFetchingNextPage}>
                  Load more replies
                </Button>
              </div>
            )}
          </>
        ) : (
          <p className="rounded-xl border border-dashed border-br-secondary px-6 py-10 text-center text-sm text-txt-secondary">
            {thread.isLocked
              ? "This thread is locked and no longer accepts replies."
              : "No replies yet. If you can answer or add something useful, be the first."}
          </p>
        )}
      </section>
    </div>
  );
}
