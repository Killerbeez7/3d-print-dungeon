import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useForum } from "@/hooks/useForum";
import { FaPlus, FaSearch } from "react-icons/fa";
import Skeleton from "@/components/shared/Skeleton";

export const ForumHome = () => {
    const { categories, threads, loading, error, searchThreads } = useForum();
    const [activeTab, setActiveTab] = useState("recent");
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        // Reset search when tab changes
        if (searchQuery) {
            setSearchQuery("");
            setSearchResults([]);
        }
    }, [activeTab]);

    const handleSearch = async (e) => {
        e.preventDefault();

        if (!searchQuery.trim()) return;

        setIsSearching(true);
        try {
            const results = await searchThreads(searchQuery);
            setSearchResults(results);
        } catch (error) {
            console.error("Error searching threads:", error);
        } finally {
            setIsSearching(false);
        }
    };

    const renderThreadListForTab = () => {
        if (searchQuery && searchResults.length > 0) {
            return (
                <div className="mt-6 space-y-4">
                    <h2 className="text-lg font-medium">
                        Search Results for "{searchQuery}"
                    </h2>
                    <div className="space-y-4">
                        {searchResults.map((thread) => (
                            <div
                                key={thread.id}
                                className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"
                            >
                                <Link
                                    to={`/forum/thread/${thread.id}`}
                                    className="text-lg font-medium hover:text-blue-600 dark:hover:text-blue-400"
                                >
                                    {thread.title}
                                </Link>
                                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                    Posted in{" "}
                                    <Link
                                        to={`/forum/category/${thread.categoryId}`}
                                        className="text-blue-600 dark:text-blue-400 hover:underline"
                                    >
                                        {categories.find(
                                            (c) => c.id === thread.categoryId
                                        )?.name || "Unknown Category"}
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        if (searchQuery && searchResults.length === 0 && !isSearching) {
            return (
                <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
                    <p className="text-gray-500 dark:text-gray-400">
                        No results found for "{searchQuery}". Try a different search term.
                    </p>
                </div>
            );
        }

        switch (activeTab) {
            case "recent":
                return (
                    <div className="mt-6">
                        <h2 className="text-lg font-medium mb-4">Recent Discussions</h2>
                        {threads.recent?.length > 0 ? (
                            <div className="space-y-4">
                                {threads.recent.map((thread) => (
                                    <div
                                        key={thread.id}
                                        className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"
                                    >
                                        <Link
                                            to={`/forum/thread/${thread.id}`}
                                            className="text-lg font-medium hover:text-blue-600 dark:hover:text-blue-400"
                                        >
                                            {thread.title}
                                        </Link>
                                        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                            Posted in{" "}
                                            <Link
                                                to={`/forum/category/${thread.categoryId}`}
                                                className="text-blue-600 dark:text-blue-400 hover:underline"
                                            >
                                                {categories.find(
                                                    (c) => c.id === thread.categoryId
                                                )?.name || "Unknown Category"}
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
                                <p className="text-gray-500 dark:text-gray-400">
                                    No recent discussions yet. Start a new thread!
                                </p>
                            </div>
                        )}
                    </div>
                );

            case "popular":
                return (
                    <div className="mt-6">
                        <h2 className="text-lg font-medium mb-4">Popular Discussions</h2>
                        {threads.popular?.length > 0 ? (
                            <div className="space-y-4">
                                {threads.popular.map((thread) => (
                                    <div
                                        key={thread.id}
                                        className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"
                                    >
                                        <Link
                                            to={`/forum/thread/${thread.id}`}
                                            className="text-lg font-medium hover:text-blue-600 dark:hover:text-blue-400"
                                        >
                                            {thread.title}
                                        </Link>
                                        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                            Posted in{" "}
                                            <Link
                                                to={`/forum/category/${thread.categoryId}`}
                                                className="text-blue-600 dark:text-blue-400 hover:underline"
                                            >
                                                {categories.find(
                                                    (c) => c.id === thread.categoryId
                                                )?.name || "Unknown Category"}
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
                                <p className="text-gray-500 dark:text-gray-400">
                                    No popular discussions yet. Start a new thread!
                                </p>
                            </div>
                        )}
                    </div>
                );

            case "unanswered":
                return (
                    <div className="mt-6">
                        <h2 className="text-lg font-medium mb-4">
                            Unanswered Discussions
                        </h2>
                        {threads.unanswered?.length > 0 ? (
                            <div className="space-y-4">
                                {threads.unanswered.map((thread) => (
                                    <div
                                        key={thread.id}
                                        className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"
                                    >
                                        <Link
                                            to={`/forum/thread/${thread.id}`}
                                            className="text-lg font-medium hover:text-blue-600 dark:hover:text-blue-400"
                                        >
                                            {thread.title}
                                        </Link>
                                        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                            Posted in{" "}
                                            <Link
                                                to={`/forum/category/${thread.categoryId}`}
                                                className="text-blue-600 dark:text-blue-400 hover:underline"
                                            >
                                                {categories.find(
                                                    (c) => c.id === thread.categoryId
                                                )?.name || "Unknown Category"}
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
                                <p className="text-gray-500 dark:text-gray-400">
                                    All discussions have been answered. Great job
                                    community!
                                </p>
                            </div>
                        )}
                    </div>
                );

            default:
                return null;
        }
    };

    if (loading && !categories.length) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-10 w-32" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div
                            key={i}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"
                        >
                            <Skeleton className="h-6 w-12 mb-2" />
                            <Skeleton className="h-4 w-3/4 mb-1" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    ))}
                </div>

                <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-700">
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-10 w-24" />
                    ))}
                </div>

                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div
                            key={i}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"
                        >
                            <Skeleton className="h-6 w-3/4 mb-2" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg text-red-700 dark:text-red-400">
                <h2 className="text-lg font-semibold mb-2">Error Loading Forum</h2>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with search and new thread button */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <form onSubmit={handleSearch} className="flex-1 max-w-md">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <FaSearch className="text-gray-500 dark:text-gray-400" />
                        </div>
                        <input
                            type="search"
                            className="block w-full p-2.5 pl-10 text-sm bg-white dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Search discussions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            disabled={isSearching}
                        />
                        <button
                            type="submit"
                            className="absolute right-1 bottom-1 top-1 px-3 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none"
                            disabled={isSearching || !searchQuery.trim()}
                        >
                            {isSearching ? "..." : "Search"}
                        </button>
                    </div>
                </form>

                <Link
                    to="/forum/new-thread"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none"
                >
                    <FaPlus className="mr-2" />
                    New Thread
                </Link>
            </div>

            {/* Categories grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                    <Link
                        key={category.id}
                        to={`/forum/category/${category.id}`}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                        <div className="flex items-center gap-3">
                            {category.icon && (
                                <span className="text-2xl">{category.icon}</span>
                            )}
                            <h3 className="font-semibold text-lg">{category.name}</h3>
                        </div>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                            {category.description}
                        </p>
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            {category.threadCount || 0} threads
                        </div>
                    </Link>
                ))}
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex space-x-8">
                    <button
                        onClick={() => setActiveTab("recent")}
                        className={`py-4 px-1 text-center border-b-2 font-medium text-sm ${
                            activeTab === "recent"
                                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                        }`}
                    >
                        Recent
                    </button>
                    <button
                        onClick={() => setActiveTab("popular")}
                        className={`py-4 px-1 text-center border-b-2 font-medium text-sm ${
                            activeTab === "popular"
                                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                        }`}
                    >
                        Popular
                    </button>
                    <button
                        onClick={() => setActiveTab("unanswered")}
                        className={`py-4 px-1 text-center border-b-2 font-medium text-sm ${
                            activeTab === "unanswered"
                                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                        }`}
                    >
                        Unanswered
                    </button>
                </nav>
            </div>

            {/* Thread list by tab */}
            {renderThreadListForTab()}
        </div>
    );
};
