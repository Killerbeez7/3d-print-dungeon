import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FolderX, Plus } from "lucide-react";

import { buttonClassName } from "@/components";
import { FORUM_CATEGORIES } from "@/config/forumCategories";
import { StatePanel } from "@/features/shared/components/StatePanel";

import { useFetchCategories } from "../hooks";
import { FORUM_PATHS } from "../constants/forumPaths";

import { ForumHeader, ForumTabs } from "./ForumUI";
import { ThreadList } from "./ThreadList";

import type { ForumThreadSortField } from "../types/forum";

const SORT_OPTIONS: { value: ForumThreadSortField; label: string }[] = [
  { value: "lastActivity", label: "Active" },
  { value: "createdAt", label: "Newest" },
  { value: "views", label: "Most viewed" },
  { value: "replyCount", label: "Most replies" },
];

export function ForumCategory() {
  const { categoryId } = useParams();
  const [sortBy, setSortBy] = useState<ForumThreadSortField>("lastActivity");

  const { data: fetchedCategories = [] } = useFetchCategories();
  const categories = fetchedCategories.length > 0 ? fetchedCategories : FORUM_CATEGORIES;
  const currentCategory = categories.find((category) => category.id === categoryId);

  if (!categoryId || !currentCategory) {
    return (
      <StatePanel
        icon={FolderX}
        title="Category not found"
        actions={
          <Link to={FORUM_PATHS.HOME} className={buttonClassName()}>
            Back to the forum
          </Link>
        }
      >
        This category doesn&apos;t exist, or it was renamed.
      </StatePanel>
    );
  }

  const Icon = FORUM_CATEGORIES.find((item) => item.id === categoryId)?.icon;

  return (
    <div>
      <ForumHeader
        eyebrow="Forum category"
        title={currentCategory.name}
        description={
          <span className="flex items-start gap-2">
            {Icon && <Icon className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />}
            {currentCategory.description}
          </span>
        }
        action={
          <Link to={FORUM_PATHS.NEW_THREAD_FOR_CATEGORY(categoryId)} className={buttonClassName()}>
            <Plus className="size-4" aria-hidden="true" />
            New thread
          </Link>
        }
      />

      <div className="mb-4">
        <ForumTabs tabs={SORT_OPTIONS} active={sortBy} onChange={setSortBy} label="Sort threads" />
      </div>

      <ThreadList categoryId={categoryId} sortBy={sortBy} />
    </div>
  );
}
