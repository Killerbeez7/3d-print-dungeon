import { Link, useParams } from "react-router-dom";
import { useEffect } from "react";
import { useForum } from "../../contexts/forumContext";
import { MdMessage, MdRemoveRedEye } from "react-icons/md";

export const ForumCategory = () => {
    const { categoryId } = useParams();
    const { 
        getThreadsByCategory, 
        currentCategoryThreads, 
        loading, 
        error 
    } = useForum();

    useEffect(() => {
        if (categoryId) {
            getThreadsByCategory(categoryId);
        }
    }, [categoryId, getThreadsByCategory]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center p-4 text-red-600">
                Error loading threads: {error}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Category: {categoryId}</h2>
            <div className="space-y-4">
                {currentCategoryThreads?.map((thread) => (
                    <div
                        key={thread.id}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
                    >
                        <Link
                            to={`../thread/${thread.id}`}
                            className="text-xl font-semibold hover:text-primary-600 dark:hover:text-primary-400"
                        >
                            {thread.title}
                        </Link>
                        <div className="mt-3 text-sm text-gray-500 dark:text-gray-400 flex gap-4">
                            <span>By: {thread.authorName}</span>
                            <span className="flex items-center gap-1">
                                <MdMessage className="w-4 h-4" />
                                {thread.replyCount || 0} replies
                            </span>
                            <span className="flex items-center gap-1">
                                <MdRemoveRedEye className="w-4 h-4" />
                                {thread.views || 0} views
                            </span>
                            <span>
                                Last activity:{" "}
                                {new Date(thread.lastActivity?.toDate() || thread.createdAt?.toDate()).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                ))}
                {(!currentCategoryThreads || currentCategoryThreads.length === 0) && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No threads found in this category
                    </div>
                )}
            </div>
        </div>
    );
};
