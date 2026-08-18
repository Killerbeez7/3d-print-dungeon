import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaPlus, FaSearch } from "react-icons/fa";

import { FORUM_CATEGORIES } from "@/config/forumCategories";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useModal } from "@/features/shared/modal/hooks/useModal";
import { InfiniteScrollList } from "@/features/shared/InfiniteScrollList";
import Skeleton from "@/features/shared/Skeleton";
import { Spinner } from "@/features/shared/reusable/Spinner";

import { useFetchCategories, useFetchThreads } from "@/features/forum/hooks";
import { formatRelativeTime, isThreadNew } from "@/features/forum/utils/threadUtils";

import type { ForumCategory, ForumThread } from "@/features/forum/types/forum";

interface ThreadCardProps {
  thread: ForumThread;
  categories: ForumCategory[];
}

function ThreadCard({ thread, categories }: ThreadCardProps) {
  const categoryName =
    categories.find((category) => {
      return category.id === thread.categoryId;
    })?.name ?? "Unknown Category";

  return (
    <article className="px-5 py-5 transition-colors duration-150 hover:bg-muted/30 sm:px-6">
      <div className="min-w-0">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Link
            to={`/forum/category/${thread.categoryId}`}
            className="text-xs font-semibold uppercase tracking-[0.14em] text-txt-muted"
          >
            {categoryName}
          </Link>

          {isThreadNew(thread) && (
            <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-txt-secondary">
              New
            </span>
          )}
        </div>

        <Link
          to={`/forum/thread/${thread.id}`}
          className="text-lg font-semibold leading-snug text-txt-primary"
        >
          {thread.title}
        </Link>

        <p className="mt-2 line-clamp-2 max-w-4xl text-sm leading-relaxed text-txt-secondary">
          {thread.content}
        </p>

        <div className="mt-4 flex flex-col gap-2 text-xs text-txt-muted sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>{thread.authorName}</span>

            <span aria-hidden="true">·</span>

            <span>{formatRelativeTime(thread.createdAt)}</span>
          </div>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {thread.replyCount !== undefined && (
              <span>
                {thread.replyCount} {thread.replyCount === 1 ? "reply" : "replies"}
              </span>
            )}

            {thread.replyCount !== undefined && thread.views !== undefined && (
              <span aria-hidden="true">·</span>
            )}

            {thread.views !== undefined && (
              <span>
                {thread.views} {thread.views === 1 ? "view" : "views"}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export function ForumHome() {
  const navigate = useNavigate();

  const { currentUser } = useAuth();
  const { open } = useModal("auth");

  const [activeTab, setActiveTab] = useState<string>("recent");

  const [searchQuery, setSearchQuery] = useState<string>("");

  const { data: fetchedCategories = [], isLoading: categoriesLoading } =
    useFetchCategories();

  const categories = fetchedCategories.length > 0 ? fetchedCategories : FORUM_CATEGORIES;

  const getThreadFilters = () => {
    switch (activeTab) {
      case "popular":
        return {
          sortBy: "views" as const,
          sortOrder: "desc" as const,
        };

      case "unanswered":
        return {
          filter: "unanswered" as const,
        };

      case "recent":
      default:
        return {
          sortBy: "createdAt" as const,
          sortOrder: "desc" as const,
        };
    }
  };

  const {
    data: threadsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: threadsLoading,
    isError: threadsError,
  } = useFetchThreads(getThreadFilters());

  const {
    data: searchData,
    fetchNextPage: fetchNextSearch,
    hasNextPage: hasNextSearch,
    isFetchingNextPage: isFetchingNextSearch,
    isLoading: searchLoading,
    refetch: refetchSearch,
  } = useFetchThreads({
    search: searchQuery,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  useEffect(() => {
    setSearchQuery("");
  }, [activeTab]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  const handleSearch = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    if (!searchQuery.trim()) {
      setSearchQuery("");
      return;
    }

    try {
      await refetchSearch();
    } catch (error) {
      console.error("Error searching threads:", error);
    }
  };

  const handleCreateThread = (): void => {
    if (!currentUser) {
      open({ mode: "login" });
      return;
    }

    navigate("/forum/new-thread");
  };

  const renderEmptyState = (
    title: string,
    description: string,
    actionLabel = "Create Thread"
  ) => {
    return (
      <div className="rounded-xl border border-br-subtle bg-surface-card px-6 py-10 shadow-sm">
        <div className="max-w-xl">
          <h3 className="text-xl font-semibold text-txt-primary">{title}</h3>

          <p className="mt-2 text-sm leading-relaxed text-txt-secondary">{description}</p>

          <div className="mt-5 flex flex-wrap gap-3">
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                }}
                className="rounded-lg border border-br-secondary bg-surface-card px-4 py-2 text-sm font-semibold text-txt-primary transition-colors hover:bg-muted"
              >
                Clear Search
              </button>
            )}

            <button
              type="button"
              onClick={handleCreateThread}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-btn-primary-text transition-colors hover:bg-accent-hover"
            >
              {actionLabel}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderThreadListForTab = () => {
    if (searchQuery && searchData) {
      const searchThreads = searchData.pages.flatMap((page) => {
        return page.threads;
      });

      if (searchThreads.length === 0) {
        return renderEmptyState(
          "No matching threads",
          "Search checks thread titles, content, category names, and tags. Try a broader term or start a new discussion."
        );
      }

      return (
        <div className="flex flex-1 flex-col">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-txt-primary">
              Search results for &quot;
              {searchQuery.trim()}&quot;
            </h2>

            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
              }}
              className="text-sm font-medium text-txt-secondary transition-colors hover:text-txt-primary"
            >
              Clear search
            </button>
          </div>

          <InfiniteScrollList
            items={searchThreads}
            hasMore={hasNextSearch}
            loadMore={fetchNextSearch}
            isLoading={isFetchingNextSearch}
            loader={<Spinner size={24} />}
          >
            <div className="divide-y divide-br-subtle overflow-hidden rounded-xl border border-br-subtle bg-surface-card shadow-sm">
              {searchThreads.map((thread) => (
                <ThreadCard key={thread.id} thread={thread} categories={categories} />
              ))}
            </div>
          </InfiniteScrollList>
        </div>
      );
    }

    const threads =
      threadsData?.pages.flatMap((page) => {
        return page.threads;
      }) ?? [];

    if (threadsLoading && threads.length === 0) {
      return (
        <div className="flex flex-1 items-center justify-center py-16">
          <Spinner size={24} />
        </div>
      );
    }

    if (threads.length === 0) {
      return renderEmptyState(
        activeTab === "unanswered"
          ? "No unanswered threads"
          : `No ${activeTab} discussions yet`,
        activeTab === "unanswered"
          ? "Every visible thread has at least one reply. Check another tab or ask a new question."
          : "Start a focused discussion so other members have something concrete to respond to."
      );
    }

    return (
      <div className="flex flex-1 flex-col">
        <h2 className="mb-4 text-lg font-semibold text-txt-primary">
          {activeTab === "recent" && "Recent Discussions"}

          {activeTab === "popular" && "Popular Discussions"}

          {activeTab === "unanswered" && "Unanswered Discussions"}
        </h2>

        <InfiniteScrollList
          items={threads}
          hasMore={hasNextPage}
          loadMore={fetchNextPage}
          isLoading={isFetchingNextPage}
          loader={<Spinner size={24} />}
        >
          <div className="divide-y divide-br-subtle overflow-hidden rounded-xl border border-br-subtle bg-surface-card shadow-sm">
            {threads.map((thread) => (
              <ThreadCard key={thread.id} thread={thread} categories={categories} />
            ))}
          </div>
        </InfiniteScrollList>
      </div>
    );
  };

  if (categoriesLoading && categories.length === 0) {
    return (
      <div className="space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-9 w-64" />

          <Skeleton className="h-5 w-96 max-w-full" />
        </div>

        <Skeleton className="h-11 w-full max-w-2xl" />

        <div className="flex gap-6 border-b border-br-secondary">
          {[0, 1, 2].map((item) => (
            <Skeleton key={item} className="h-10 w-24" />
          ))}
        </div>

        <div className="divide-y divide-br-subtle overflow-hidden rounded-xl border border-br-subtle bg-surface-card shadow-sm">
          {[0, 1, 2].map((item) => (
            <div key={item} className="px-5 py-5 sm:px-6">
              <Skeleton className="mb-3 h-4 w-24" />

              <Skeleton className="mb-4 h-6 w-3/4" />

              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (threadsError) {
    return (
      <div className="rounded-xl border border-error/30 bg-error/10 p-6 text-error">
        <h2 className="mb-2 text-lg font-semibold">Error Loading Forum</h2>

        <p>Failed to load forum threads. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col">
      {/* Header */}
      <header className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-bold leading-tight text-txt-primary">
            Community Forum
          </h1>

          <p className="mt-3 max-w-2xl text-base leading-relaxed text-txt-secondary">
            Discuss 3D printing, models, techniques, workflows, and ideas with the
            community.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreateThread}
          className="inline-flex items-center justify-center gap-2 self-start rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-btn-primary-text transition-colors hover:bg-accent-hover lg:self-auto"
        >
          <FaPlus size={13} aria-hidden="true" />
          New Thread
        </button>
      </header>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-5 w-full">
        <div className="relative w-full max-w-2xl">
          <FaSearch
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-txt-muted"
            aria-hidden="true"
          />

          <input
            type="search"
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value);
            }}
            disabled={searchLoading}
            placeholder="Search discussions..."
            className="block w-full rounded-lg border border-br-secondary bg-surface-card py-3 pr-4 pl-10 text-sm text-txt-primary outline-none transition-colors placeholder:text-txt-muted focus:border-focus focus:ring-2 focus:ring-focus/15"
          />
        </div>
      </form>

      {/* Mobile categories */}
      <div className="mb-6 flex flex-wrap gap-2 md:hidden">
        {categories.map((category) => {
          const configCategory = FORUM_CATEGORIES.find((item) => {
            return item.id === category.id;
          });

          const CategoryIcon = configCategory?.icon;

          return (
            <Link
              key={category.id}
              to={`/forum/category/${category.id}`}
              className="inline-flex items-center gap-2 rounded-full border border-br-subtle px-3 py-1.5 text-sm text-txt-secondary transition-colors hover:bg-muted hover:text-txt-primary"
            >
              {CategoryIcon && <CategoryIcon size={15} aria-hidden="true" />}

              {category.name}
            </Link>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="mb-4 border-b border-br-secondary">
        <nav className="flex gap-8 overflow-x-auto" aria-label="Forum discussion filters">
          {[
            ["recent", "Recent"],
            ["popular", "Popular"],
            ["unanswered", "Unanswered"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setActiveTab(value);
              }}
              className={`border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                activeTab === value
                  ? "border-accent text-txt-primary"
                  : "border-transparent text-txt-muted hover:text-txt-primary"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex flex-1 flex-col">{renderThreadListForTab()}</div>
    </div>
  );
}
