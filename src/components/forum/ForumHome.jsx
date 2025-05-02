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
                        Search Results for &quot;{searchQuery}&quot;
                    </h2>
                    <div className="space-y-4">
                        {searchResults.map((thread) => (
                            <div
                                key={thread.id}
                                className="bg-[var(--bg-surface)] text-[var(--txt-primary)] rounded-lg shadow p-6">
                                <Link
                                    to={`/forum/thread/${thread.id}`}
                                    className="text-lg font-medium hover:text-[var(--accent)]">
                                    {thread.title}
                                </Link>
                                <div className="mt-2 text-sm text-[var(--txt-muted)]">
                                    Posted in{" "}
                                    <Link
                                        to={`/forum/category/${thread.categoryId}`}
                                        className="text-[var(--accent)] hover:underline">
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
                <div className="mt-6 bg-[var(--bg-surface)] text-[var(--txt-primary)] rounded-lg shadow p-6 text-center">
                    <p className="text-[var(--txt-muted)]">
                        No results found for &quot;{searchQuery}&quot;. Try a different
                        search term.
                    </p>
                </div>
            );
        }

        switch (activeTab) {
            case "recent":
                return (
                    <div className="mt-6">
                        <h2 className="text-lg font-medium mb-4">
                            Recent Discussions
                        </h2>
                        {threads.recent?.length > 0 ? (
                            <div className="space-y-4">
                                {threads.recent.map((thread) => (
                                    <div
                                        key={thread.id}
                                        className="bg-[var(--bg-surface)] text-[var(--txt-primary)] rounded-lg shadow p-6">
                                        <Link
                                            to={`/forum/thread/${thread.id}`}
                                            className="text-lg font-medium hover:text-[var(--accent)]">
                                            {thread.title}
                                        </Link>
                                        <div className="mt-2 text-sm text-[var(--txt-muted)]">
                                            Posted in{" "}
                                            <Link
                                                to={`/forum/category/${thread.categoryId}`}
                                                className="text-[var(--accent)] hover:underline">
                                                {categories.find(
                                                    (c) =>
                                                        c.id ===
                                                        thread.categoryId
                                                )?.name || "Unknown Category"}
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-[var(--bg-surface)] text-[var(--txt-primary)] rounded-lg shadow p-6 text-center">
                                <p className="text-[var(--txt-muted)]">
                                    No recent discussions yet. Start a new
                                    thread!
                                </p>
                            </div>
                        )}
                    </div>
                );

            case "popular":
                return (
                    <div className="mt-6">
                        <h2 className="text-lg font-medium mb-4">
                            Popular Discussions
                        </h2>
                        {threads.popular?.length > 0 ? (
                            <div className="space-y-4">
                                {threads.popular.map((thread) => (
                                    <div
                                        key={thread.id}
                                        className="bg-[var(--bg-surface)] text-[var(--txt-primary)] rounded-lg shadow p-6">
                                        <Link
                                            to={`/forum/thread/${thread.id}`}
                                            className="text-lg font-medium hover:text-[var(--accent)]">
                                            {thread.title}
                                        </Link>
                                        <div className="mt-2 text-sm text-[var(--txt-muted)]">
                                            Posted in{" "}
                                            <Link
                                                to={`/forum/category/${thread.categoryId}`}
                                                className="text-[var(--accent)] hover:underline">
                                                {categories.find(
                                                    (c) =>
                                                        c.id ===
                                                        thread.categoryId
                                                )?.name || "Unknown Category"}
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-[var(--bg-surface)] text-[var(--txt-primary)] rounded-lg shadow p-6 text-center">
                                <p className="text-[var(--txt-muted)]">
                                    No popular discussions yet. Start a new
                                    thread!
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
                                        className="bg-[var(--bg-surface)] text-[var(--txt-primary)] rounded-lg shadow p-6">
                                        <Link
                                            to={`/forum/thread/${thread.id}`}
                                            className="text-lg font-medium hover:text-[var(--accent)]">
                                            {thread.title}
                                        </Link>
                                        <div className="mt-2 text-sm text-[var(--txt-muted)]">
                                            Posted in{" "}
                                            <Link
                                                to={`/forum/category/${thread.categoryId}`}
                                                className="text-[var(--accent)] hover:underline">
                                                {categories.find(
                                                    (c) =>
                                                        c.id ===
                                                        thread.categoryId
                                                )?.name || "Unknown Category"}
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-[var(--bg-surface)] text-[var(--txt-primary)] rounded-lg shadow p-6 text-center">
                                <p className="text-[var(--txt-muted)]">
                                    All discussions have been answered. Great
                                    job community!
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
                            className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
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
                            className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
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
                <h2 className="text-lg font-semibold mb-2">
                    Error Loading Forum
                </h2>
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
                            <FaSearch className="text-[var(--txt-muted)]" />
                        </div>
                        <input
                            type="search"
                            className="block w-full p-2.5 pl-10 text-sm bg-[var(--bg-surface)] text-[var(--txt-primary)] rounded-lg border border-[var(--br-secondary)] focus:ring-[var(--accent)] focus:border-[var(--accent)]"
                            placeholder="Search discussions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            disabled={isSearching}
                        />
                        <button
                            type="submit"
                            className="absolute right-1 bottom-1 top-1 px-3 rounded bg-[var(--accent)] text-[var(--txt-highlight)] hover:bg-[var(--accent-hover)] focus:outline-none transition"
                            disabled={isSearching || !searchQuery.trim()}>
                            {isSearching ? "..." : "Search"}
                        </button>
                    </div>
                </form>

                <Link
                    to="/forum/new-thread"
                    className="inline-flex items-center px-4 py-2 rounded-lg font-semibold bg-[var(--accent)] text-[var(--txt-highlight)] hover:bg-[var(--accent-hover)] focus:outline-none transition">
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
                        className="bg-[var(--bg-surface)] text-[var(--txt-primary)] rounded-lg shadow p-4 hover:bg-[var(--bg-tertiary)] transition">
                        <div className="flex items-center gap-3">
                            {category.icon && (
                                <span className="text-2xl">
                                    {category.icon}
                                </span>
                            )}
                            <h3 className="font-semibold text-lg">
                                {category.name}
                            </h3>
                        </div>
                        <p className="mt-2 text-sm text-[var(--txt-secondary)] line-clamp-2">
                            {category.description}
                        </p>
                        <div className="mt-2 text-xs text-[var(--txt-muted)]">
                            {category.threadCount || 0} threads
                        </div>
                    </Link>
                ))}
            </div>

            {/* Tabs */}
            <div className="border-b border-[var(--br-secondary)]">
                <nav className="flex space-x-8">
                    <button
                        onClick={() => setActiveTab("recent")}
                        className={`py-4 px-1 text-center border-b-2 font-medium text-sm ${
                            activeTab === "recent"
                                ? "border-[var(--accent)] text-[var(--accent)]"
                                : "border-transparent text-[var(--txt-muted)] hover:text-[var(--txt-primary)] hover:border-[var(--br-secondary)]"
                        }`}>
                        Recent
                    </button>
                    <button
                        onClick={() => setActiveTab("popular")}
                        className={`py-4 px-1 text-center border-b-2 font-medium text-sm ${
                            activeTab === "popular"
                                ? "border-[var(--accent)] text-[var(--accent)]"
                                : "border-transparent text-[var(--txt-muted)] hover:text-[var(--txt-primary)] hover:border-[var(--br-secondary)]"
                        }`}>
                        Popular
                    </button>
                    <button
                        onClick={() => setActiveTab("unanswered")}
                        className={`py-4 px-1 text-center border-b-2 font-medium text-sm ${
                            activeTab === "unanswered"
                                ? "border-[var(--accent)] text-[var(--accent)]"
                                : "border-transparent text-[var(--txt-muted)] hover:text-[var(--txt-primary)] hover:border-[var(--br-secondary)]"
                        }`}>
                        Unanswered
                    </button>
                </nav>
            </div>

            {/* Thread list by tab */}
            {renderThreadListForTab()}
        </div>
    );
};
