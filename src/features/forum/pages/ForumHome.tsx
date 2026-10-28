import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MessagesSquare, Plus, Search, SearchX, X } from "lucide-react";

import { Button } from "@/components";
import { StatePanel } from "@/features/shared/components/StatePanel";

import { FORUM_CATEGORIES } from "@/config/forumCategories";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useModal } from "@/features/shared/modal/hooks/useModal";
import { InfiniteScrollList } from "@/features/shared/InfiniteScrollList";
import { Spinner } from "@/features/shared/reusable/Spinner";

import { useFetchCategories, useFetchThreads } from "@/features/forum/hooks";
import {
  ForumHeader,
  ForumTabs,
  ThreadListFrame,
  ThreadListSkeleton,
  ThreadRow,
} from "@/features/forum/components/ForumUI";

type ForumTab = "recent" | "popular" | "unanswered";

const TABS: { value: ForumTab; label: string }[] = [
  { value: "recent", label: "Recent" },
  { value: "popular", label: "Popular" },
  { value: "unanswered", label: "Unanswered" },
];

export function ForumHome() {
  const navigate = useNavigate();

  const { currentUser } = useAuth();
  const { open } = useModal("auth");

  const [activeTab, setActiveTab] = useState<ForumTab>("recent");

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

  const renderEmptyState = (title: string, description: string) => (
    <StatePanel
      icon={searchQuery ? SearchX : MessagesSquare}
      title={title}
      headingLevel="h2"
      className="min-h-[40vh] rounded-xl border border-dashed border-br-secondary"
      actions={
        <>
          {searchQuery && (
            <Button variant="secondary" onClick={() => setSearchQuery("")}>
              Clear search
            </Button>
          )}
          <Button onClick={handleCreateThread} leftIcon={<Plus className="size-4" aria-hidden="true" />}>
            New thread
          </Button>
        </>
      }
    >
      {description}
    </StatePanel>
  );

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
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h2 className="label-mono text-txt-muted">
              {searchThreads.length} results for “{searchQuery.trim()}”
            </h2>
          </div>

          <InfiniteScrollList
            items={searchThreads}
            hasMore={hasNextSearch}
            loadMore={fetchNextSearch}
            isLoading={isFetchingNextSearch}
            loader={<div className="flex justify-center py-8"><Spinner size={24} /></div>}
          >
            <ThreadListFrame>
              {searchThreads.map((thread) => (
                <ThreadRow key={thread.id} thread={thread} categories={categories} />
              ))}
            </ThreadListFrame>
          </InfiniteScrollList>
        </div>
      );
    }

    const threads =
      threadsData?.pages.flatMap((page) => {
        return page.threads;
      }) ?? [];

    if (threadsLoading && threads.length === 0) {
      return <ThreadListSkeleton />;
    }

    if (threads.length === 0) {
      return renderEmptyState(
        activeTab === "unanswered"
          ? "Every thread has a reply"
          : "No discussions yet",
        activeTab === "unanswered"
          ? "Every visible thread has at least one reply. Check another tab or ask a new question."
          : "Start a focused discussion so other members have something concrete to respond to."
      );
    }

    return (
      <div className="flex flex-1 flex-col">
        <InfiniteScrollList
          items={threads}
          hasMore={hasNextPage}
          loadMore={fetchNextPage}
          isLoading={isFetchingNextPage}
          loader={<div className="flex justify-center py-8"><Spinner size={24} /></div>}
        >
          <ThreadListFrame>
            {threads.map((thread) => (
              <ThreadRow key={thread.id} thread={thread} categories={categories} />
            ))}
          </ThreadListFrame>
        </InfiniteScrollList>
      </div>
    );
  };

  if (categoriesLoading && categories.length === 0) {
    return <ThreadListSkeleton />;
  }

  if (threadsError) {
    return (
      <StatePanel icon={MessagesSquare} title="Couldn't load the forum" headingLevel="h1">
        Check your connection and refresh the page.
      </StatePanel>
    );
  }

  return (
    <div className="flex min-h-full flex-col">
      <ForumHeader
        eyebrow="Community"
        title="Forum"
        description="Ask questions, share prints and swap tips with other makers."
        action={
          <Button onClick={handleCreateThread} leftIcon={<Plus className="size-4" aria-hidden="true" />}>
            New thread
          </Button>
        }
      />

      {/* Search */}
      <form onSubmit={handleSearch} role="search" className="mb-5">
        <div className="relative max-w-2xl">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-txt-muted"
            aria-hidden="true"
          />
          <input
            type="search"
            aria-label="Search discussions"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            disabled={searchLoading}
            placeholder="Search discussions"
            className="h-11 w-full rounded-lg border border-br-input bg-page pl-10 pr-10 text-sm text-txt-primary transition-colors placeholder:text-txt-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25 [&::-webkit-search-cancel-button]:appearance-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
              className="absolute right-1.5 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-txt-muted hover:bg-muted hover:text-txt-primary"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </form>

      {/* Phones: categories as a scrolling chip row (the sidebar is hidden) */}
      <nav aria-label="Forum categories" className="-mx-4 mb-5 flex gap-1.5 overflow-x-auto px-4 pb-1 md:hidden">
        {categories.map((category) => {
          const CategoryIcon = FORUM_CATEGORIES.find((item) => item.id === category.id)?.icon;
          return (
            <Link
              key={category.id}
              to={`/forum/category/${category.id}`}
              className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border border-br-secondary px-3 text-sm text-txt-secondary transition-colors hover:border-br-primary hover:text-txt-primary"
            >
              {CategoryIcon && <CategoryIcon className="size-4" aria-hidden="true" />}
              {category.name}
            </Link>
          );
        })}
      </nav>

      {!searchQuery && (
        <div className="mb-4">
          <ForumTabs tabs={TABS} active={activeTab} onChange={setActiveTab} label="Sort discussions" />
        </div>
      )}

      <div className="flex flex-1 flex-col">{renderThreadListForTab()}</div>
    </div>
  );
}
