import { useState, type ChangeEvent } from "react";

import { Link, useParams } from "react-router-dom";

import { FORUM_CATEGORIES } from "@/config/forumCategories";

import { useFetchCategories } from "../hooks";
import { FORUM_PATHS } from "../constants/forumPaths";

import { ThreadList } from "./ThreadList";

import type { ForumThreadSortField } from "../types/forum";

export const ForumCategory = () => {
  const { categoryId } = useParams();

  const [sortBy, setSortBy] = useState<ForumThreadSortField>("lastActivity");

  const { data: fetchedCategories = [] } = useFetchCategories();

  const categories = fetchedCategories.length > 0 ? fetchedCategories : FORUM_CATEGORIES;

  const currentCategory = categories.find((category) => {
    return category.id === categoryId;
  });

  const handleSortChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSortBy(event.target.value as ForumThreadSortField);
  };

  if (!categoryId || !currentCategory) {
    return (
      <div className="rounded-xl border border-br-secondary bg-surface-card p-8 text-center text-txt-primary shadow-sm">
        <h2 className="mb-3 text-xl font-semibold">Category Not Found</h2>

        <p className="mb-6 text-txt-secondary">
          The category you&apos;re looking for does not exist.
        </p>

        <Link
          to={FORUM_PATHS.HOME}
          className="inline-block rounded-lg bg-accent px-4 py-2 font-semibold text-txt-highlight transition hover:bg-accent-hover"
        >
          Return to Forum
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-br-secondary bg-surface-card p-6 shadow-sm">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-txt-muted">
          Forum Category
        </p>

        <h1 className="text-2xl font-bold text-txt-primary">{currentCategory.name}</h1>

        <p className="mt-2 max-w-3xl text-txt-secondary">{currentCategory.description}</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-br-secondary bg-surface-card p-4">
        <div className="flex items-center gap-2">
          <label htmlFor="sortBy" className="text-sm font-medium text-txt-secondary">
            Sort by
          </label>

          <select
            id="sortBy"
            value={sortBy}
            onChange={handleSortChange}
            className="rounded-lg border border-br-secondary bg-page px-3 py-2 text-sm text-txt-primary focus:border-accent focus:outline-none"
          >
            <option value="lastActivity">Last Activity</option>

            <option value="createdAt">Newest</option>

            <option value="views">Most Viewed</option>

            <option value="replyCount">Most Replies</option>
          </select>
        </div>

        <Link
          to={FORUM_PATHS.NEW_THREAD_FOR_CATEGORY(categoryId)}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-txt-highlight transition hover:bg-accent-hover"
        >
          New Thread
        </Link>
      </div>

      <ThreadList categoryId={categoryId} sortBy={sortBy} />
    </div>
  );
};
