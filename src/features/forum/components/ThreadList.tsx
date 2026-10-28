import { MessagesSquare } from "lucide-react";

import { Button } from "@/components";
import { StatePanel } from "@/features/shared/components/StatePanel";

import { useFetchCategories, useFetchThreads } from "../hooks";
import { ThreadListFrame, ThreadListSkeleton, ThreadRow } from "./ForumUI";

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
  const { data: categories = [] } = useFetchCategories();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error } =
    useFetchThreads({ categoryId, sortBy, sortOrder: "desc" });

  const threads = data?.pages.flatMap((page) => page.threads) ?? [];

  if (isLoading) {
    return <ThreadListSkeleton />;
  }

  if (error) {
    return (
      <StatePanel icon={MessagesSquare} title="Couldn't load discussions" headingLevel="h2" className="min-h-[30vh]">
        Check your connection and refresh the page.
      </StatePanel>
    );
  }

  if (threads.length === 0) {
    return (
      <StatePanel
        icon={MessagesSquare}
        title="No threads yet"
        headingLevel="h2"
        className="min-h-[30vh] rounded-xl border border-dashed border-br-secondary"
      >
        {categoryId
          ? "This category is ready for its first discussion."
          : "Start a new thread to get the conversation going."}
      </StatePanel>
    );
  }

  return (
    <div className="space-y-4">
      <ThreadListFrame>
        {threads.map((thread) => (
          <ThreadRow
            key={thread.id}
            thread={thread}
            categories={categories}
            showCategory={showCategory}
            showPreview={!isCompact}
            timeField="lastActivity"
          />
        ))}
      </ThreadListFrame>

      {hasNextPage && (
        <div className="flex justify-center">
          <Button variant="secondary" onClick={() => void fetchNextPage()} isLoading={isFetchingNextPage}>
            Load more
          </Button>
        </div>
      )}
    </div>
  );
}
