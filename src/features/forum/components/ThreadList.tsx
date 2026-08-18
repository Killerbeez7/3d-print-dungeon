import { Link, useNavigate } from "react-router-dom";
import { FaLock, FaTag, FaThumbtack } from "react-icons/fa";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { useModal } from "@/features/shared/modal/hooks/useModal";
import Skeleton from "@/features/shared/Skeleton";
import { Spinner } from "@/features/shared/reusable/Spinner";

import { useFetchCategories, useFetchThreads } from "../hooks";

import { FORUM_PATHS } from "../constants/forumPaths";
import { formatRelativeTime } from "../utils/threadUtils";

import type { ForumThreadSortField } from "../types/forum";

interface ThreadListProps {
  categoryId?: string;
  sortBy?: ForumThreadSortField;
  showCategory?: boolean;
  isCompact?: boolean;
}

export function ThreadList({
  categoryId,
  sortBy = "lastActivity",
  showCategory = false,
  isCompact = false,
}: ThreadListProps) {
  const { currentUser } = useAuth();
  const { open } = useModal("auth");
  const navigate = useNavigate();

  const { data: categories = [] } = useFetchCategories();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error } =
    useFetchThreads({
      categoryId,
      sortBy,
      sortOrder: "desc",
    });

  const threads =
    data?.pages.flatMap((page) => {
      return page.threads;
    }) ?? [];

  const newThreadPath = categoryId
    ? FORUM_PATHS.NEW_THREAD_FOR_CATEGORY(categoryId)
    : FORUM_PATHS.NEW_THREAD;

  const handleCreateThread = (): void => {
    if (!currentUser) {
      open({ mode: "login" });
      return;
    }

    navigate(newThreadPath);
  };

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-xl border border-br-subtle bg-surface-card shadow-sm divide-y divide-br-subtle">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="px-5 py-5 sm:px-6">
            <Skeleton className="mb-3 h-4 w-24" />
            <Skeleton className="mb-3 h-6 w-3/4" />
            <Skeleton className="mb-4 h-4 w-full max-w-3xl" />

            <div className="flex gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-error/30 bg-error/10 p-5 text-error">
        <p className="font-medium">Unable to load discussions</p>

        <p className="mt-1 text-sm">{error.message}</p>
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <div className="rounded-xl border border-br-subtle bg-surface-card p-6 shadow-sm">
        <h3 className="mb-2 text-xl font-semibold text-txt-primary">No threads yet</h3>

        <p className="mb-5 text-sm leading-relaxed text-txt-secondary">
          {categoryId
            ? "This category is ready for discussion. Start the first thread or browse another category."
            : "There are no discussions to show yet. Start a new thread to get the conversation going."}
        </p>

        <button
          type="button"
          onClick={handleCreateThread}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-btn-primary-text shadow-sm transition-colors hover:bg-accent-hover"
        >
          {categoryId ? "Create Thread in This Category" : "Create Thread"}
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-br-subtle bg-surface-card shadow-sm divide-y divide-br-subtle">
      {threads.map((thread) => {
        const categoryName =
          categories.find((category) => {
            return category.id === thread.categoryId;
          })?.name ?? "Category";

        return (
          <article
            key={thread.id}
            className={[
              "group px-5 text-txt-primary transition-colors duration-200 hover:bg-muted/35 sm:px-6",
              isCompact ? "py-4" : "py-5",
            ].join(" ")}
          >
            <div className="min-w-0">
              {/* Category */}
              {showCategory && (
                <Link
                  to={FORUM_PATHS.CATEGORY(thread.categoryId)}
                  className="mb-2 inline-block text-xs font-semibold uppercase tracking-[0.16em] text-accent transition-colors hover:text-accent-hover"
                >
                  {categoryName}
                </Link>
              )}

              {/* Title + status */}
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  to={FORUM_PATHS.THREAD(thread.id)}
                  className="text-lg font-semibold leading-snug text-txt-primary transition-colors hover:text-txt-highlight"
                >
                  {thread.title}
                </Link>

                {thread.isPinned && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2 py-1 text-xs font-medium text-warning">
                    <FaThumbtack size={9} aria-hidden="true" />
                    Pinned
                  </span>
                )}

                {thread.isLocked && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-error/10 px-2 py-1 text-xs font-medium text-error">
                    <FaLock size={9} aria-hidden="true" />
                    Locked
                  </span>
                )}
              </div>

              {/* Preview */}
              {!isCompact && (
                <p className="mt-2 line-clamp-2 max-w-4xl text-sm leading-relaxed text-txt-secondary">
                  {thread.content}
                </p>
              )}

              {/* Tags */}
              {!isCompact && thread.tags && thread.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {thread.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-full bg-muted px-2 py-1 text-xs text-txt-secondary"
                    >
                      <FaTag
                        className="mr-1 text-txt-muted"
                        size={9}
                        aria-hidden="true"
                      />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Metadata */}
            <div
              className={[
                "flex flex-col gap-2 text-xs text-txt-muted sm:flex-row sm:items-center sm:justify-between",
                isCompact ? "mt-3" : "mt-4",
              ].join(" ")}
            >
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span>{thread.authorName}</span>
                <span aria-hidden="true">·</span>
                <span>{formatRelativeTime(thread.lastActivity)}</span>
              </div>

              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span>
                  {thread.replyCount} {thread.replyCount === 1 ? "reply" : "replies"}
                </span>

                <span aria-hidden="true">·</span>

                <span>
                  {thread.views} {thread.views === 1 ? "view" : "views"}
                </span>
              </div>
            </div>
          </article>
        );
      })}

      {hasNextPage && (
        <div className="flex justify-center px-5 py-5">
          <button
            type="button"
            onClick={() => {
              void fetchNextPage();
            }}
            disabled={isFetchingNextPage}
            className="min-w-32 rounded-lg border border-br-secondary bg-surface-card px-5 py-2.5 text-sm font-semibold text-txt-primary transition-colors hover:border-br-primary hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isFetchingNextPage ? <Spinner size={12} /> : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
}
