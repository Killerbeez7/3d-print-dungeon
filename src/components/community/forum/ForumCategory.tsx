import { useState, ChangeEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { FORUM_CATEGORIES } from "@/config/forumCategories";
import { ThreadList } from "./ThreadList";

export const ForumCategory = () => {
    const { categoryId } = useParams<Record<string, string | undefined>>();
    const [sortBy, setSortBy] = useState<string>("lastActivity");
    const currentCategory = FORUM_CATEGORIES.find((cat) => cat.id === categoryId);

    const handleSortChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setSortBy(e.target.value);
    };

    if (!currentCategory) {
        return (
            <div className="bg-[var(--bg-surface)] text-[var(--txt-primary)] rounded-lg shadow p-6 text-center">
                <h2 className="text-xl font-semibold mb-4">Category Not Found</h2>
                <p className="text-[var(--txt-secondary)] mb-6">
                    The category you&apos;re looking for does not exist.
                </p>
                <Link
                    to="/forum"
                    className="inline-block px-4 py-2 rounded-lg font-semibold bg-[var(--accent)] text-[var(--txt-highlight)] hover:bg-[var(--accent-hover)] transition"
                >
                    Return to Forum
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Category Header */}
            <div className="bg-[var(--bg-surface)] text-[var(--txt-primary)] rounded-lg shadow p-6">
                <h1 className="text-2xl font-bold">{currentCategory.name}</h1>
                <p className="mt-2 text-[var(--txt-secondary)]">
                    {currentCategory.description}
                </p>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div className="flex items-center">
                    <label
                        htmlFor="sortBy"
                        className="mr-2 text-sm font-medium text-[var(--txt-primary)]"
                    >
                        Sort by:
                    </label>
                    <select
                        id="sortBy"
                        value={sortBy}
                        onChange={handleSortChange}
                        className="rounded-md border-[var(--br-secondary)] shadow-sm bg-[var(--bg-surface)] text-[var(--txt-primary)] text-sm focus:ring-[var(--accent)] focus:border-[var(--accent)]"
                    >
                        <option value="lastActivity">Last Activity</option>
                        <option value="createdAt">Newest</option>
                        <option value="views">Most Viewed</option>
                        <option value="replyCount">Most Replies</option>
                    </select>
                </div>
            </div>

            {/* Thread List */}
            <ThreadList categoryId={categoryId ?? ""} sortBy={sortBy} />
        </div>
    );
};
