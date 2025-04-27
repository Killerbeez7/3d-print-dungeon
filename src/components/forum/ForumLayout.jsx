import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useForum } from "@/hooks/useForum";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

export const ForumLayout = () => {
    const location = useLocation();
    const { categories, loading } = useForum();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="relative flex min-h-screen">
            {/* Sidebar */}
            <div
                className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-white dark:bg-gray-900 shadow-lg transition-transform duration-300 md:relative md:translate-x-0 ${
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <div className="flex flex-col h-full">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            Community Forum
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Discuss 3D printing topics
                        </p>
                    </div>

                    <div className="p-4 flex-1 overflow-auto">
                        <nav className="space-y-1">
                            <Link
                                to="/forum"
                                className={`block px-3 py-2 rounded-md ${
                                    location.pathname === "/forum"
                                        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                                }`}
                            >
                                Home
                            </Link>

                            <div className="mt-4 mb-2">
                                <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Categories
                                </h3>
                            </div>

                            {loading ? (
                                <div className="animate-pulse space-y-2">
                                    {[...Array(5)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="h-10 bg-gray-200 dark:bg-gray-700 rounded"
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {categories.map((category) => (
                                        <Link
                                            key={category.id}
                                            to={`/forum/category/${category.id}`}
                                            className={`flex items-center px-3 py-2 rounded-md ${
                                                location.pathname ===
                                                `/forum/category/${category.id}`
                                                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                                                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                                            }`}
                                        >
                                            {category.icon && (
                                                <span className="mr-2 text-lg">
                                                    {category.icon}
                                                </span>
                                            )}
                                            <span>{category.name}</span>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </nav>
                    </div>

                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                        <Link
                            to="/forum/new-thread"
                            className="block w-full py-2 px-4 text-center rounded-md bg-blue-600 text-white hover:bg-blue-700"
                        >
                            New Thread
                        </Link>
                    </div>
                </div>
            </div>

            {/* Sidebar toggle button for mobile */}
            <button
                onClick={toggleSidebar}
                className="fixed bottom-4 left-4 md:hidden z-40 p-2 rounded-full bg-blue-600 text-white shadow-lg"
                aria-label="Toggle sidebar"
            >
                {isSidebarOpen ? <FaChevronLeft /> : <FaChevronRight />}
            </button>

            {/* Main content */}
            <div className="flex-1 p-4 md:p-6 md:ml-6">
                <Outlet />
            </div>
        </div>
    );
};
