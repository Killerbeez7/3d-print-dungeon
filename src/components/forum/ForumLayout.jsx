import { Outlet, Link, useLocation } from "react-router-dom";
import { useState } from "react";

export const ForumLayout = () => {
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const categories = [
        {
            id: 1,
            name: "General Discussion",
            description: "General topics about 3D printing",
            threadCount: 150,
            icon: "💬",
        },
        {
            id: 2,
            name: "Technical Support",
            description: "Get help with technical issues",
            threadCount: 89,
            icon: "🔧",
        },
        {
            id: 3,
            name: "Showcase",
            description: "Show off your 3D prints",
            threadCount: 234,
            icon: "🎨",
        },
        {
            id: 4,
            name: "Marketplace",
            description: "Buy and sell 3D prints",
            threadCount: 78,
            icon: "🛒",
        },
        {
            id: 5,
            name: "Events",
            description: "Upcoming events and meetups",
            threadCount: 45,
            icon: "📅",
        },
    ];

    return (
        <div className="flex h-full">
            {/* Sidebar */}
            <div
                className={`${
                    isSidebarOpen ? "w-64" : "w-0"
                } bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 overflow-hidden`}
            >
                <div className="p-4">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold">Categories</h2>
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        >
                            {isSidebarOpen ? "←" : "→"}
                        </button>
                    </div>
                    <div className="space-y-2">
                        {categories.map((category) => (
                            <Link
                                key={category.id}
                                to={`category/${category.id}`}
                                className={`flex items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
                                    location.pathname.includes(`category/${category.id}`)
                                        ? "bg-primary-50 dark:bg-primary-900"
                                        : ""
                                }`}
                            >
                                <span className="text-2xl mr-3">{category.icon}</span>
                                <div>
                                    <div className="font-medium">{category.name}</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {category.threadCount} threads
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Community Forum</h1>
                    <Link
                        to="new-thread"
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
                    >
                        New Thread
                    </Link>
                </div>
                <Outlet />
            </div>
        </div>
    );
};
