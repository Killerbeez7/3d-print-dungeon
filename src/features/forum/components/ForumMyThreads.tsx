import { useState } from "react";
import { Link } from "react-router-dom";
import { MessagesSquare, Pencil, Plus, Search, Trash2, UserRound } from "lucide-react";

import { Button, buttonClassName } from "@/components";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { StatePanel } from "@/features/shared/components/StatePanel";
import { useModal } from "@/features/shared/modal/hooks/useModal";

import { FORUM_PATHS } from "../constants/forumPaths";
import { useDeleteThread, useFetchCategories, useFetchThreads } from "../hooks";
import { ForumAlert, ForumHeader, ThreadListFrame, ThreadListSkeleton, ThreadRow } from "./ForumUI";

import type { FetchThreadsOptions, ForumThread } from "../types/forum";

type SortOption = "newest" | "oldest" | "mostViews" | "mostReplies" | "lastActivity";

type FilterOption = "all" | "recent" | "popular" | "unanswered" | "pinned";

export function ForumMyThreads() {
  const { currentUser } = useAuth();
  const { open } = useModal("auth");

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
      <StatePanel
        icon={UserRound}
        title="Sign in to see your threads"
        actions={<Button onClick={() => open({ mode: "signin" })}>Sign in</Button>}
      >
        Your discussions and how people respond to them show up here.
      </StatePanel>
    );
  }

  const thisMonth = allThreads.filter(
    (thread) => Date.now() - getThreadDate(thread.createdAt).getTime() <= 30 * 24 * 60 * 60 * 1000
  ).length;

  const statItems = [
    { label: "Threads", value: stats.totalThreads },
    { label: "Views", value: stats.totalViews },
    { label: "Replies received", value: stats.totalRepliesReceived },
    { label: "Avg views", value: stats.avgViewsPerThread },
    { label: "This month", value: thisMonth },
    { label: "Pinned", value: stats.pinnedThreads },
  ];

  const isFiltered = Boolean(searchQuery) || filterBy !== "all";

  return (
    <div>
      <ForumHeader
        eyebrow="Your activity"
        title="My threads"
        description="Manage your discussions and see how the community responds."
        action={
          <Link to={FORUM_PATHS.NEW_THREAD} className={buttonClassName()}>
            <Plus className="size-4" aria-hidden="true" />
            New thread
          </Link>
        }
      />

      <dl className="mb-8 grid grid-cols-3 border-y border-br-subtle lg:grid-cols-6">
        {statItems.map((stat, index) => (
          <div
            key={stat.label}
            className={`px-3 py-3 ${index % 3 !== 0 ? "border-l border-br-subtle" : ""} ${
              index >= 3 ? "border-t border-br-subtle lg:border-t-0" : ""
            } lg:border-l lg:first:border-l-0`}
          >
            <dt className="label-mono truncate text-txt-muted">{stat.label}</dt>
            <dd className="mt-1 font-mono text-xl font-semibold text-txt-primary">{stat.value}</dd>
          </div>
        ))}
      </dl>

      {/* Controls */}
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative sm:max-w-xs sm:flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-txt-muted"
            aria-hidden="true"
          />
          <input
            type="search"
            aria-label="Search your threads"
            placeholder="Search your threads"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="field h-10 pl-9"
          />
        </div>
        <div className="flex gap-2">
          <select
            aria-label="Filter threads"
            value={filterBy}
            onChange={(event) => setFilterBy(event.target.value as FilterOption)}
            className="field h-10 w-auto"
          >
            <option value="all">All threads</option>
            <option value="recent">This week</option>
            <option value="popular">Popular</option>
            <option value="unanswered">Unanswered</option>
            <option value="pinned">Pinned</option>
          </select>
          <select
            aria-label="Sort threads"
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as SortOption)}
            className="field h-10 w-auto"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="mostViews">Most views</option>
            <option value="mostReplies">Most replies</option>
            <option value="lastActivity">Last activity</option>
          </select>
        </div>
        <span className="font-mono text-xs text-txt-muted sm:ml-auto">
          {filteredThreads.length} of {allThreads.length}
        </span>
      </div>

      {deleteThreadError && (
        <div className="mb-4">
          <ForumAlert>Couldn&apos;t delete that thread: {deleteThreadError.message}</ForumAlert>
        </div>
      )}

      {threadsLoading ? (
        <ThreadListSkeleton rows={3} />
      ) : threadsError ? (
        <StatePanel
          icon={MessagesSquare}
          title="Couldn't load your threads"
          headingLevel="h2"
          className="min-h-[30vh]"
          actions={<Button onClick={() => window.location.reload()}>Try again</Button>}
        />
      ) : filteredThreads.length > 0 ? (
        <div className="space-y-4">
          <ThreadListFrame>
            {filteredThreads.map((thread) => {
              const isDeletingThisThread = isDeletingThread && deletingThreadId === thread.id;
              return (
                <ThreadRow
                  key={thread.id}
                  thread={thread}
                  categories={categories}
                  actions={
                    <>
                      <Link
                        to={FORUM_PATHS.THREAD_EDIT(thread.id)}
                        aria-label={`Edit ${thread.title}`}
                        className={buttonClassName({ variant: "ghost", size: "sm" })}
                      >
                        <Pencil className="size-3.5" aria-hidden="true" />
                        Edit
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => void handleDeleteThread(thread)}
                        disabled={isDeletingThisThread}
                        aria-label={`Delete ${thread.title}`}
                        className="text-error"
                        leftIcon={<Trash2 className="size-3.5" aria-hidden="true" />}
                      >
                        {isDeletingThisThread ? "Deleting…" : "Delete"}
                      </Button>
                    </>
                  }
                />
              );
            })}
          </ThreadListFrame>

          {hasNextPage && (
            <div className="flex justify-center">
              <Button variant="secondary" onClick={() => void fetchNextPage()} isLoading={isFetchingNextPage}>
                Load more
              </Button>
            </div>
          )}
        </div>
      ) : (
        <StatePanel
          icon={MessagesSquare}
          title={isFiltered ? "No threads match" : "No threads yet"}
          headingLevel="h2"
          className="min-h-[30vh] rounded-xl border border-dashed border-br-secondary"
          actions={
            <>
              {isFiltered && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSearchQuery("");
                    setFilterBy("all");
                  }}
                >
                  Clear filters
                </Button>
              )}
              <Link to={FORUM_PATHS.NEW_THREAD} className={buttonClassName()}>
                New thread
              </Link>
            </>
          }
        >
          {isFiltered ? "Try another search or filter." : "Start your first discussion to see it here."}
        </StatePanel>
      )}
    </div>
  );
}
