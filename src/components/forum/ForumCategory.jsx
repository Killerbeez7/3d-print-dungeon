import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useForum } from "@/hooks/useForum";
import { ThreadList } from "./ThreadList";
import { FaPlus } from "react-icons/fa";
import Skeleton from "@/components/shared/Skeleton";

export const ForumCategory = () => {
    const { categoryId } = useParams();
    const { getCategory, currentCategory, loading, error } = useForum();
    const [sortBy, setSortBy] = useState("lastActivity");

    useEffect(() => {
        if (categoryId) {
            getCategory(categoryId);
        }
    }, [categoryId, getCategory]);

    const handleSortChange = (e) => {
        setSortBy(e.target.value);
    };

    if (loading && !currentCategory) {
        return (
            <div className="space-y-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <Skeleton className="h-8 w-1/3 mb-4" />
                    <Skeleton className="h-5 w-3/4 mb-3" />
                </div>

                <div className="flex justify-between items-center mb-6">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-8 w-32" />
                </div>

                {[...Array(3)].map((_, i) => (
                    <div
                        key={i}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg text-red-700 dark:text-red-400">
                <h2 className="text-lg font-semibold mb-2">
                    Error Loading Category
                </h2>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Category Header */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center gap-3">
                    {currentCategory?.icon && (
                        <span className="text-3xl">{currentCategory.icon}</span>
                    )}
                    <h1 className="text-2xl font-bold">
                        {currentCategory?.name}
                    </h1>
                </div>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                    {currentCategory?.description}
                </p>
                <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                    {currentCategory?.threadCount || 0} threads in this category
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div className="flex items-center">
                    <label
                        htmlFor="sortBy"
                        className="mr-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Sort by:
                    </label>
                    <select
                        id="sortBy"
                        value={sortBy}
                        onChange={handleSortChange}
                        className="rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm focus:ring-blue-500 focus:border-blue-500">
                        <option value="lastActivity">Last Activity</option>
                        <option value="createdAt">Newest</option>
                        <option value="views">Most Viewed</option>
                        <option value="replyCount">Most Replies</option>
                    </select>
                </div>

                <Link
                    to={`/forum/new-thread?category=${categoryId}`}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                    <FaPlus className="mr-2" size={12} />
                    New Thread
                </Link>
            </div>

            {/* Thread List */}
            <ThreadList categoryId={categoryId} sortBy={sortBy} />
        </div>
    );
};
