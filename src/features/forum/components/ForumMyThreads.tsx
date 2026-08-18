import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaCalendar,
  FaChartLine,
  FaComment,
  FaEdit,
  FaEye,
  FaFilter,
  FaLock,
  FaStar,
  FaThumbtack,
  FaTrash,
} from "react-icons/fa";

import Skeleton from "@/features/shared/Skeleton";
import { useAuth } from "@/features/auth/hooks/useAuth";

import { FORUM_PATHS } from "../constants/forumPaths";
import { formatRelativeTime } from "../utils/threadUtils";
import { useDeleteThread, useFetchCategories, useFetchThreads } from "../hooks";

import type { FetchThreadsOptions, ForumThread } from "../types/forum";

type SortOption = "newest" | "oldest" | "mostViews" | "mostReplies" | "lastActivity";

type FilterOption = "all" | "recent" | "popular" | "unanswered" | "pinned";

export function ForumMyThreads() {
  const { currentUser } = useAuth();

  const {
    mutateAsync: deleteThread,
    isPending: isDeletingThread,
    variables: deletingThreadId,
    error: deleteThreadError,
  } = useDeleteThread();

  const { data: categories = [] } = useFetchCategories();

  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const getThreadFilters = (): FetchThreadsOptions => {
    const filters: FetchThreadsOptions = {
      authorId: currentUser?.uid ?? "",
    };

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
      case "all":
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
  } = useFetchThreads(getThreadFilters());

  const allThreads =
    threadsData?.pages.flatMap((page) => {
      return page.threads;
    }) ?? [];

  let filteredThreads = allThreads;

  if (filterBy === "popular") {
    filteredThreads = filteredThreads.filter((thread) => {
      return thread.views > 50 || thread.replyCount > 5;
    });
  }

  const normalizedSearch = searchQuery.trim().toLowerCase();

  if (normalizedSearch) {
    filteredThreads = filteredThreads.filter((thread) => {
      const titleMatches = thread.title.toLowerCase().includes(normalizedSearch);

      const contentMatches = thread.content.toLowerCase().includes(normalizedSearch);

      return titleMatches || contentMatches;
    });
  }

  const totalThreads = allThreads.length;

  const totalViews = allThreads.reduce((sum, thread) => {
    return sum + thread.views;
  }, 0);

  const totalRepliesReceived = allThreads.reduce((sum, thread) => {
    return sum + thread.replyCount;
  }, 0);

  const pinnedThreads = allThreads.filter((thread) => {
    return thread.isPinned;
  }).length;

  const lockedThreads = allThreads.filter((thread) => {
    return thread.isLocked;
  }).length;

  const stats = {
    totalThreads,
    totalViews,
    totalRepliesReceived,
    pinnedThreads,
    lockedThreads,
    avgViewsPerThread: totalThreads > 0 ? Math.round(totalViews / totalThreads) : 0,
    avgRepliesPerThread:
      totalThreads > 0 ? Math.round(totalRepliesReceived / totalThreads) : 0,
  };

  const getThreadDate = (value: ForumThread["createdAt"]): Date => {
    return value;
  };

  const handleDeleteThread = async (thread: ForumThread): Promise<void> => {
    const confirmed = window.confirm(
      `Delete "${thread.title}"? This removes the thread and its replies.`
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteThread(thread.id);
    } catch {
      // Mutation error is rendered below.
    }
  };

  if (!currentUser) {
    return (
      <div className="mx-auto max-w-4xl rounded-xl border border-br-subtle bg-surface-card p-8 text-center shadow-sm">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
          My Threads
        </p>

        <h1 className="text-2xl font-bold text-txt-primary">
          Sign in to manage your discussions
        </h1>

        <p className="mx-auto mt-2 max-w-xl text-txt-secondary">
          Your threads, engagement statistics, and management tools will appear here.
        </p>

        <Link
          to={FORUM_PATHS.HOME}
          className="mt-6 inline-flex items-center justify-center rounded-lg border border-br-secondary bg-surface-card px-4 py-2 text-sm font-semibold text-txt-primary transition-colors hover:bg-muted"
        >
          Back to Forum
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      {/* Header */}
      <header>
        {/* <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
          Your Activity
        </p> */}

        <h1 className="text-3xl font-bold text-txt-primary">My Threads</h1>

        <p className="mt-2 max-w-2xl text-txt-secondary">
          Manage your discussions and see how the community is engaging with them.
        </p>
      </header>

      {/* Main stats */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-br-subtle bg-surface-card p-5 shadow-sm">
          <div className="text-2xl font-bold text-txt-primary">{stats.totalThreads}</div>

          <div className="mt-1 text-sm text-txt-muted">Total Threads</div>
        </div>

        <div className="rounded-xl border border-br-subtle bg-surface-card p-5 shadow-sm">
          <div className="text-2xl font-bold text-txt-primary">{stats.totalViews}</div>

          <div className="mt-1 text-sm text-txt-muted">Total Views</div>
        </div>

        <div className="rounded-xl border border-br-subtle bg-surface-card p-5 shadow-sm">
          <div className="text-2xl font-bold text-txt-primary">
            {stats.totalRepliesReceived}
          </div>

          <div className="mt-1 text-sm text-txt-muted">Replies Received</div>
        </div>

        <div className="rounded-xl border border-br-subtle bg-surface-card p-5 shadow-sm">
          <div className="text-2xl font-bold text-txt-primary">
            {stats.avgViewsPerThread}
          </div>

          <div className="mt-1 text-sm text-txt-muted">Avg Views / Thread</div>
        </div>
      </section>

      {/* Secondary insights */}
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-br-subtle bg-surface-card p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-accent-soft text-accent">
              <FaChartLine size={14} aria-hidden="true" />
            </div>

            <h2 className="font-semibold text-txt-primary">Engagement</h2>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-txt-secondary">Avg Views</span>

              <span className="font-semibold text-txt-primary">
                {stats.avgViewsPerThread}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-txt-secondary">Avg Replies</span>

              <span className="font-semibold text-txt-primary">
                {stats.avgRepliesPerThread}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-br-subtle bg-surface-card p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-accent-soft text-accent">
              <FaThumbtack size={13} aria-hidden="true" />
            </div>

            <h2 className="font-semibold text-txt-primary">Thread Status</h2>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-txt-secondary">Pinned</span>

              <span className="font-semibold text-warning">{stats.pinnedThreads}</span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-txt-secondary">Locked</span>

              <span className="font-semibold text-error">{stats.lockedThreads}</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-br-subtle bg-surface-card p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-accent-soft text-accent">
              <FaStar size={13} aria-hidden="true" />
            </div>

            <h2 className="font-semibold text-txt-primary">Recent Activity</h2>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-txt-secondary">This Week</span>

              <span className="font-semibold text-txt-primary">
                {
                  allThreads.filter((thread) => {
                    const daysSinceCreated =
                      (Date.now() - getThreadDate(thread.createdAt).getTime()) /
                      (1000 * 60 * 60 * 24);

                    return daysSinceCreated <= 7;
                  }).length
                }
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-txt-secondary">This Month</span>

              <span className="font-semibold text-txt-primary">
                {
                  allThreads.filter((thread) => {
                    const daysSinceCreated =
                      (Date.now() - getThreadDate(thread.createdAt).getTime()) /
                      (1000 * 60 * 60 * 24);

                    return daysSinceCreated <= 30;
                  }).length
                }
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Controls */}
      <section className="flex flex-col gap-4 rounded-xl border border-br-subtle bg-surface-card p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <div className="relative flex-1 sm:max-w-xs">
            <FaFilter
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-txt-muted"
              size={12}
              aria-hidden="true"
            />

            <input
              type="search"
              placeholder="Search your threads..."
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
              }}
              className="w-full rounded-lg border border-br-secondary bg-page py-2.5 pr-3 pl-9 text-sm text-txt-primary outline-none transition placeholder:text-txt-muted focus:border-focus focus:ring-2 focus:ring-focus/15"
            />
          </div>

          <select
            value={filterBy}
            onChange={(event) => {
              setFilterBy(event.target.value as FilterOption);
            }}
            className="rounded-lg border border-br-secondary bg-page px-3 py-2.5 text-sm text-txt-primary outline-none transition focus:border-focus focus:ring-2 focus:ring-focus/15"
          >
            <option value="all">All Threads</option>
            <option value="recent">Recent</option>
            <option value="popular">Popular</option>
            <option value="unanswered">Unanswered</option>
            <option value="pinned">Pinned</option>
          </select>

          <select
            value={sortBy}
            onChange={(event) => {
              setSortBy(event.target.value as SortOption);
            }}
            className="rounded-lg border border-br-secondary bg-page px-3 py-2.5 text-sm text-txt-primary outline-none transition focus:border-focus focus:ring-2 focus:ring-focus/15"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="mostViews">Most Views</option>
            <option value="mostReplies">Most Replies</option>
            <option value="lastActivity">Last Activity</option>
          </select>
        </div>

        <span className="shrink-0 text-sm text-txt-muted">
          {filteredThreads.length} of {allThreads.length} threads
        </span>
      </section>

      {deleteThreadError && (
        <div className="rounded-xl border border-error/30 bg-error/10 p-4 text-sm text-error">
          {deleteThreadError.message}
        </div>
      )}

      {/* Threads */}
      <section className="space-y-3">
        {threadsLoading ? (
          [0, 1, 2].map((item) => (
            <div
              key={item}
              className="rounded-xl border border-br-subtle bg-surface-card p-5 shadow-sm"
            >
              <Skeleton className="mb-3 h-6 w-3/4" />
              <Skeleton className="mb-4 h-4 w-full" />

              <div className="flex gap-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          ))
        ) : threadsError ? (
          <div className="rounded-xl border border-error/30 bg-error/10 p-8 text-center">
            <p className="mb-4 font-medium text-error">Error loading threads</p>

            <button
              type="button"
              onClick={() => {
                window.location.reload();
              }}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-btn-primary-text transition-colors hover:bg-accent-hover"
            >
              Retry
            </button>
          </div>
        ) : filteredThreads.length > 0 ? (
          <>
            {filteredThreads.map((thread) => {
              const isDeletingThisThread =
                isDeletingThread && deletingThreadId === thread.id;

              const categoryName =
                categories.find((category) => {
                  return category.id === thread.categoryId;
                })?.name ?? "Category";

              return (
                <article
                  key={thread.id}
                  className="group rounded-xl border border-br-subtle bg-surface-card p-5 shadow-sm transition-all duration-200 hover:border-accent/30 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wide text-accent">
                          {categoryName}
                        </span>

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

                      <Link
                        to={FORUM_PATHS.THREAD(thread.id)}
                        className="text-lg font-semibold text-txt-primary transition-colors group-hover:text-accent"
                      >
                        {thread.title}
                      </Link>

                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-txt-secondary">
                        {thread.content}
                      </p>

                      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-br-subtle pt-4 text-sm text-txt-muted">
                        <span className="inline-flex items-center gap-1.5">
                          <FaCalendar size={11} aria-hidden="true" />
                          {formatRelativeTime(thread.createdAt)}
                        </span>

                        <span className="inline-flex items-center gap-1.5">
                          <FaEye size={11} aria-hidden="true" />
                          {thread.views} views
                        </span>

                        <span className="inline-flex items-center gap-1.5">
                          <FaComment size={11} aria-hidden="true" />
                          {thread.replyCount} replies
                        </span>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      <Link
                        to={FORUM_PATHS.THREAD_EDIT(thread.id)}
                        className="flex size-9 items-center justify-center rounded-lg text-txt-secondary transition-colors hover:bg-muted hover:text-accent"
                        title="Edit Thread"
                        aria-label={`Edit ${thread.title}`}
                      >
                        <FaEdit size={13} aria-hidden="true" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          void handleDeleteThread(thread);
                        }}
                        disabled={isDeletingThisThread}
                        className="flex size-9 items-center justify-center rounded-lg text-txt-secondary transition-colors hover:bg-error/10 hover:text-error disabled:cursor-not-allowed disabled:opacity-60"
                        title="Delete Thread"
                        aria-label={`Delete ${thread.title}`}
                      >
                        {isDeletingThisThread ? (
                          <span className="text-xs">...</span>
                        ) : (
                          <FaTrash size={13} aria-hidden="true" />
                        )}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}

            {hasNextPage && (
              <div className="flex justify-center pt-4">
                <button
                  type="button"
                  onClick={() => {
                    void fetchNextPage();
                  }}
                  disabled={isFetchingNextPage}
                  className="rounded-lg border border-br-secondary bg-surface-card px-5 py-2.5 text-sm font-semibold text-txt-primary shadow-sm transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isFetchingNextPage ? "Loading..." : "Load More"}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-xl border border-br-subtle bg-surface-card p-8 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-txt-primary">
              {searchQuery || filterBy !== "all" ? "No threads found" : "No threads yet"}
            </h2>

            <p className="mx-auto mt-2 max-w-xl text-sm text-txt-secondary">
              {searchQuery || filterBy !== "all"
                ? "Try adjusting your search or filter criteria."
                : "Start your first discussion to see it here."}
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {(searchQuery || filterBy !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setFilterBy("all");
                  }}
                  className="rounded-lg border border-br-secondary bg-surface-card px-4 py-2 text-sm font-semibold text-txt-primary transition-colors hover:bg-muted"
                >
                  Clear Filters
                </button>
              )}

              <Link
                to={FORUM_PATHS.NEW_THREAD}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-btn-primary-text transition-colors hover:bg-accent-hover"
              >
                Create Thread
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
