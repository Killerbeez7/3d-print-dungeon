import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useForum } from "@/hooks/useForum";
import ForumSidebar from "./ForumSidebar";

export const ForumLayout = () => {
    const { categories } = useForum();
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);

    useEffect(() => {
        const handleResize = () => {
            setIsSidebarOpen(window.innerWidth >= 768);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const handleSidebarClick = () => {
        if (window.innerWidth < 768) {
            setIsSidebarOpen(false);
        }
    };

    return (
        <div className="relative flex min-h-screen">
            <ForumSidebar
                isSidebarOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
                handleSidebarClick={handleSidebarClick}
                categories={categories}
            />
            {/* Main content */}
            <div
                className={`flex-1 mt-2 p-4 transition-all duration-200 ${
                    isSidebarOpen ? "ml-[300px]" : "ml-[60px]"
                }`}
            >
                <Outlet />
            </div>
        </div>
    );
};
