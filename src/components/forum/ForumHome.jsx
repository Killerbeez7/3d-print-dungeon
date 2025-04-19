import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useForum } from "../../contexts/forumContext";
import { MdMessage, MdRemoveRedEye } from "react-icons/md";

export const ForumHome = () => {
    const [activeTab, setActiveTab] = useState("recent");
    const { 
        recentThreads, 
        popularThreads, 
        unansweredThreads, 
        loading, 
        error 
    } = useForum();

    const threads = {
        recent: recentThreads,
        popular: popularThreads,
        unanswered: unansweredThreads,
    };

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
        <div className="space-y-6">
            {/* Tabs */}
            <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-700">
                {["recent", "popular", "unanswered"].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 font-medium capitalize ${
                            activeTab === tab
                                ? "text-primary-600 border-b-2 border-primary-600"
                                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Threads List */}
            <div className="space-y-4">
                {threads[activeTab]?.map((thread) => (
                    <div
                        key={thread.id}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-md transition-shadow"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <Link
                                    to={`thread/${thread.id}`}
                                    className="text-xl font-semibold hover:text-primary-600 dark:hover:text-primary-400"
                                >
                                    {thread.title}
                                </Link>
                                <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    in{" "}
                                    <Link
                                        to={`category/${thread.categoryId}`}
                                        className="hover:text-primary-600 dark:hover:text-primary-400"
                                    >
                                        {thread.categoryName}
                                    </Link>{" "}
                                    by {thread.authorName}
                                </div>
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                {new Date(thread.lastActivity?.toDate() || thread.createdAt?.toDate()).toLocaleDateString()}
                            </div>
                        </div>
                        <div className="mt-3 flex gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                                <MdMessage className="w-4 h-4" />
                                {thread.replyCount || 0} replies
                            </span>
                            <span className="flex items-center gap-1">
                                <MdRemoveRedEye className="w-4 h-4" />
                                {thread.views || 0} views
                            </span>
                        </div>
                    </div>
                ))}
                {(!threads[activeTab] || threads[activeTab].length === 0) && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No threads found
                    </div>
                )}
            </div>
        </div>
    );
};
