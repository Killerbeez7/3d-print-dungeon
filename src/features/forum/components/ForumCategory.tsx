import { useState, type ChangeEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { FaPlus } from "react-icons/fa";

import { FORUM_CATEGORIES } from "@/config/forumCategories";

import { useFetchCategories } from "../hooks";
import { FORUM_PATHS } from "../constants/forumPaths";

import { ThreadList } from "./ThreadList";

import type { ForumThreadSortField } from "../types/forum";

export function ForumCategory() {
  const { categoryId } = useParams();

  const [sortBy, setSortBy] = useState<ForumThreadSortField>("lastActivity");

  const { data: fetchedCategories = [] } = useFetchCategories();

  const categories = fetchedCategories.length > 0 ? fetchedCategories : FORUM_CATEGORIES;

  const currentCategory = categories.find((category) => {
    return category.id === categoryId;
  });

  const handleSortChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    setSortBy(event.target.value as ForumThreadSortField);
  };

  if (!categoryId || !currentCategory) {
    return (
      <div className="rounded-xl border border-br-subtle bg-surface-card p-8 text-center shadow-sm">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-error">
          Forum
        </p>

        <h2 className="mb-3 text-xl font-semibold text-txt-primary">
          Category Not Found
        </h2>

        <p className="mb-6 text-txt-secondary">
          The category you&apos;re looking for does not exist.
        </p>

        <Link
          to={FORUM_PATHS.HOME}
          className="inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-btn-primary-text transition-colors hover:bg-accent-hover"
        >
          Return to Forum
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Category header */}
      <header className="relative overflow-hidden rounded-xl border border-br-subtle bg-surface-card p-6 shadow-sm">
        <div className="absolute inset-y-0 left-0 w-1 bg-accent" />

        <div className="pl-2">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
            Forum Category
          </p>

          <h1 className="text-2xl font-bold text-txt-primary">{currentCategory.name}</h1>

          <p className="mt-2 max-w-3xl leading-relaxed text-txt-secondary">
            {currentCategory.description}
          </p>
        </div>
      </header>

      {/* Controls */}
      <div className="flex flex-col gap-3 rounded-xl border border-br-subtle bg-surface-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <label htmlFor="sortBy" className="text-sm font-medium text-txt-secondary">
            Sort by
          </label>

          <select
            id="sortBy"
            value={sortBy}
            onChange={handleSortChange}
            className="rounded-lg border border-br-secondary bg-page px-3 py-2 text-sm text-txt-primary outline-none transition focus:border-focus focus:ring-2 focus:ring-focus/15"
          >
            <option value="lastActivity">Last Activity</option>
            <option value="createdAt">Newest</option>
            <option value="views">Most Viewed</option>
            <option value="replyCount">Most Replies</option>
          </select>
        </div>

        <Link
          to={FORUM_PATHS.NEW_THREAD_FOR_CATEGORY(categoryId)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-btn-primary-text shadow-sm transition-all hover:bg-accent-hover hover:shadow-md"
        >
          <FaPlus size={11} aria-hidden="true" />
          New Thread
        </Link>
      </div>

      {/* Discussions */}
      <ThreadList categoryId={categoryId} sortBy={sortBy} />
    </div>
  );
}
