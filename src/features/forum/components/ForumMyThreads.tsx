import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaEye,
  FaStar,
  FaEdit,
  FaLock,
  FaTrash,
  FaFilter,
  FaComment,
  FaCalendar,
  FaChartLine,
  FaThumbtack,
} from "react-icons/fa";

import Skeleton from "@/features/shared/Skeleton";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { FORUM_PATHS } from "../constants/forumPaths";
import { formatRelativeTime } from "../utils/threadUtils";
import { useDeleteThread, useFetchCategories, useFetchThreads } from "../hooks";

import type { FetchThreadsOptions, ForumThread } from "../types/forum";

type SortOption = "newest" | "oldest" | "mostViews" | "mostReplies" | "lastActivity";
type FilterOption = "all" | "recent" | "popular" | "unanswered" | "pinned";

export const ForumMyThreads = () => {
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
  const [searchQuery, setSearchQuery] = useState<string>("");
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
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-txt-primary">My Threads</h1>

          <p className="text-txt-secondary">Please log in to view your threads.</p>

          <Link
            to={FORUM_PATHS.HOME}
            className="inline-block px-6 py-3 bg-accent text-txt-highlight rounded-lg hover:bg-accent-hover transition-colors"
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
        <h1 className="text-4xl font-bold text-txt-primary">My Threads</h1>

        <p className="text-lg text-txt-secondary max-w-2xl mx-auto leading-relaxed">
          Manage and track your forum contributions, engagement, and community impact.
        </p>
      </div>

      {/* Statistics Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="p-6 border border-br-secondary rounded-xl bg-muted text-center">
          <div className="text-2xl font-bold text-txt-primary mb-2">
            {stats.totalThreads}
          </div>

          <div className="text-sm text-txt-secondary">Total Threads</div>
        </div>

        <div className="p-6 border border-br-secondary rounded-xl bg-muted text-center">
          <div className="text-2xl font-bold text-txt-primary mb-2">
            {stats.totalViews}
          </div>

          <div className="text-sm text-txt-secondary">Total Views</div>
        </div>

        <div className="p-6 border border-br-secondary rounded-xl bg-muted text-center">
          <div className="text-2xl font-bold text-txt-primary mb-2">
            {stats.totalRepliesReceived}
          </div>

          <div className="text-sm text-txt-secondary">Replies Received</div>
        </div>

        <div className="p-6 border border-br-secondary rounded-xl bg-muted text-center">
          <div className="text-2xl font-bold text-txt-primary mb-2">
            {stats.avgViewsPerThread}
          </div>

          <div className="text-sm text-txt-secondary">Avg Views/Thread</div>
        </div>
      </div>

      {/* Advanced Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 border border-br-secondary rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <FaChartLine className="text-txt-secondary" size={20} />

            <h3 className="font-semibold text-txt-primary">Engagement Metrics</h3>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-txt-secondary">Avg Views/Thread</span>

              <span className="font-semibold text-txt-primary">
                {stats.avgViewsPerThread}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-txt-secondary">Avg Replies/Thread</span>

              <span className="font-semibold text-txt-primary">
                {stats.avgRepliesPerThread}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 border border-br-secondary rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <FaThumbtack className="text-txt-secondary" size={20} />

            <h3 className="font-semibold text-txt-primary">Thread Status</h3>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-txt-secondary">Pinned Threads</span>

              <span className="font-semibold text-txt-primary">
                {stats.pinnedThreads}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-txt-secondary">Locked Threads</span>

              <span className="font-semibold text-txt-primary">
                {stats.lockedThreads}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 border border-br-secondary rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <FaStar className="text-txt-secondary" size={20} />

            <h3 className="font-semibold text-txt-primary">Activity Summary</h3>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-txt-secondary">This Week</span>

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

            <div className="flex justify-between">
              <span className="text-sm text-txt-secondary">This Month</span>

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
              onChange={(event) => {
                setSearchQuery(event.target.value);
              }}
              className="pl-10 pr-4 py-2 border border-br-secondary rounded-lg bg-surface-card text-txt-primary focus:outline-none focus:border-br-primary"
            />

            <FaFilter
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-txt-secondary"
              size={14}
            />
          </div>

          {/* Filter */}
          <select
            value={filterBy}
            onChange={(event) => {
              setFilterBy(event.target.value as FilterOption);
            }}
            className="px-4 py-2 border border-br-secondary rounded-lg bg-surface-card text-txt-primary focus:outline-none focus:border-br-primary"
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
            onChange={(event) => {
              setSortBy(event.target.value as SortOption);
            }}
            className="px-4 py-2 border border-br-secondary rounded-lg bg-surface-card text-txt-primary focus:outline-none focus:border-br-primary"
          >
            <option value="newest">Newest First</option>

            <option value="oldest">Oldest First</option>

            <option value="mostViews">Most Views</option>

            <option value="mostReplies">Most Replies</option>

            <option value="lastActivity">Last Activity</option>
          </select>
        </div>

        <div className="text-sm text-txt-secondary">
          {filteredThreads.length} of {allThreads.length} threads
        </div>
      </div>

      {deleteThreadError && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">
          {deleteThreadError.message}
        </div>
      )}

      {/* Threads List */}
      <div className="space-y-4">
        {threadsLoading ? (
          [...Array(3)].map((_, index) => {
            return (
              <div key={index} className="p-6 border border-br-secondary rounded-xl">
                <Skeleton className="h-6 w-3/4 mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-4" />

                <div className="flex gap-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            );
          })
        ) : threadsError ? (
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">Error loading threads</div>

            <button
              type="button"
              onClick={() => {
                window.location.reload();
              }}
              className="px-4 py-2 bg-accent text-txt-highlight rounded-lg"
            >
              Retry
            </button>
          </div>
        ) : filteredThreads.length > 0 ? (
          <>
            {filteredThreads.map((thread) => {
              const isDeletingThisThread =
                isDeletingThread && deletingThreadId === thread.id;

              return (
                <div
                  key={thread.id}
                  className="p-6 border border-br-secondary rounded-xl hover:border-br-primary transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Link
                          to={FORUM_PATHS.THREAD(thread.id)}
                          className="text-lg font-semibold text-txt-primary hover:text-accent transition-colors"
                        >
                          {thread.title}
                        </Link>

                        {thread.isPinned && (
                          <FaThumbtack className="text-yellow-500" size={14} />
                        )}

                        {thread.isLocked && <FaLock className="text-red-500" size={14} />}
                      </div>

                      <p className="text-txt-secondary mb-4 line-clamp-2">
                        {thread.content}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-txt-secondary">
                        <div className="flex items-center gap-1">
                          <FaCalendar size={12} />

                          <span>{formatRelativeTime(thread.createdAt)}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <FaEye size={12} />

                          <span>{thread.views} views</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <FaComment size={12} />

                          <span>{thread.replyCount} replies</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <span className="px-2 py-1 bg-muted rounded-full text-xs">
                            {categories.find((category) => {
                              return category.id === thread.categoryId;
                            })?.name ?? "Category"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        to={FORUM_PATHS.THREAD_EDIT(thread.id)}
                        className="p-2 text-txt-secondary hover:text-accent hover:bg-muted rounded-lg transition-colors"
                        title="Edit Thread"
                      >
                        <FaEdit size={14} />
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          void handleDeleteThread(thread);
                        }}
                        disabled={isDeletingThisThread}
                        className="p-2 text-txt-secondary hover:text-red-500 hover:bg-muted rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                        title="Delete Thread"
                      >
                        {isDeletingThisThread ? (
                          <span className="text-xs">...</span>
                        ) : (
                          <FaTrash size={14} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {hasNextPage && (
              <div className="flex justify-center mt-6">
                <button
                  type="button"
                  onClick={() => {
                    void fetchNextPage();
                  }}
                  disabled={isFetchingNextPage}
                  className="px-6 py-3 bg-accent text-txt-highlight rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50"
                >
                  {isFetchingNextPage ? "Loading..." : "Load More"}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-txt-primary mb-2">
              {searchQuery || filterBy !== "all" ? "No threads found" : "No threads yet"}
            </h3>

            <p className="text-txt-secondary mb-6">
              {searchQuery || filterBy !== "all"
                ? "Try adjusting your search or filter criteria."
                : "Start your first discussion to see it here!"}
            </p>

            <div className="flex flex-wrap justify-center gap-3">
              {(searchQuery || filterBy !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setFilterBy("all");
                  }}
                  className="px-6 py-3 border border-br-secondary text-txt-primary rounded-lg hover:bg-muted transition-colors"
                >
                  Clear Filters
                </button>
              )}

              <Link
                to={FORUM_PATHS.NEW_THREAD}
                className="inline-block px-6 py-3 bg-accent text-txt-highlight rounded-lg hover:bg-accent-hover transition-colors"
              >
                Create Thread
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
