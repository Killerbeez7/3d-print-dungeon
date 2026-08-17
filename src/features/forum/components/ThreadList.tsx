import { Link, useNavigate } from "react-router-dom";

import { FaCalendar, FaComment, FaEye, FaTag, FaUser } from "react-icons/fa";

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

export const ThreadList = ({
  categoryId,
  sortBy = "lastActivity",
  showCategory = false,
  isCompact = false,
}: ThreadListProps) => {
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

  const handleCreateThread = () => {
    if (!currentUser) {
      open({ mode: "login" });
      return;
    }

    navigate(newThreadPath);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2, 3].map((item) => {
          return (
            <div
              key={item}
              className="rounded-xl border border-br-secondary bg-surface-card p-5 shadow-sm"
            >
              <Skeleton className="mb-3 h-5 w-3/4" />

              <div className="flex flex-wrap gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-28" />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5 text-red-400">
        Error loading threads: {error.message}
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <div className="rounded-xl border border-br-secondary bg-surface-card p-8 text-center text-txt-primary shadow-sm">
        <h3 className="mb-2 text-lg font-semibold">No threads yet</h3>

        <p className="mx-auto mb-5 max-w-xl text-sm text-txt-muted">
          {categoryId
            ? "This category is ready for discussion. Start the first thread or browse another category."
            : "There are no discussions to show yet. Start a new thread to get the conversation going."}
        </p>

        <button
          type="button"
          onClick={handleCreateThread}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-txt-highlight transition hover:bg-accent-hover"
        >
          {categoryId ? "Create Thread in This Category" : "Create Thread"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {threads.map((thread) => {
        const categoryName = categories.find((category) => {
          return category.id === thread.categoryId;
        })?.name;

        return (
          <article
            key={thread.id}
            className={[
              "rounded-xl border bg-surface-card text-txt-primary shadow-sm transition",
              "border-br-secondary hover:border-br-primary",
              thread.isPinned ? "border-l-4 border-l-yellow-400" : "",
              isCompact ? "p-3" : "p-5",
            ].join(" ")}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <Link
                  to={FORUM_PATHS.THREAD(thread.id)}
                  className="text-lg font-semibold transition hover:text-accent"
                >
                  {thread.title}
                </Link>

                {!isCompact && thread.tags && thread.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {thread.tags.map((tag) => {
                      return (
                        <span
                          key={tag}
                          className="inline-flex items-center rounded-full bg-muted px-2 py-1 text-xs text-txt-secondary"
                        >
                          <FaTag className="mr-1 text-txt-muted" size={10} />

                          {tag}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              {thread.isLocked && (
                <span className="shrink-0 rounded-full bg-red-500/10 px-2 py-1 text-xs font-medium text-red-400">
                  Locked
                </span>
              )}
            </div>

            <div
              className={[
                "flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-txt-muted",
                isCompact ? "mt-2" : "mt-4",
              ].join(" ")}
            >
              <span className="inline-flex items-center">
                <FaUser className="mr-1.5" size={12} />

                {thread.authorName}
              </span>

              <span className="inline-flex items-center">
                <FaComment className="mr-1.5" size={12} />
                {thread.replyCount} replies
              </span>

              <span className="inline-flex items-center">
                <FaEye className="mr-1.5" size={12} />
                {thread.views} views
              </span>

              <span className="inline-flex items-center">
                <FaCalendar className="mr-1.5" size={12} />

                {formatRelativeTime(thread.lastActivity)}
              </span>

              {showCategory && (
                <Link
                  to={FORUM_PATHS.CATEGORY(thread.categoryId)}
                  className="ml-auto font-medium text-accent hover:underline"
                >
                  {categoryName ?? "Category"}
                </Link>
              )}
            </div>
          </article>
        );
      })}

      {hasNextPage && (
        <div className="flex justify-center pt-3">
          <button
            type="button"
            onClick={() => {
              void fetchNextPage();
            }}
            disabled={isFetchingNextPage}
            className="rounded-lg border border-br-secondary bg-surface-card px-5 py-2 text-sm font-semibold text-txt-primary transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isFetchingNextPage ? <Spinner size={12} /> : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
};
