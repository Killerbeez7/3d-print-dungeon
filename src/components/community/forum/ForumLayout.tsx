import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useForum } from "@/hooks/useForum";
import { ForumSidebar } from "./ForumSidebar";
import type { ForumCategory } from "@/types/forum";

export interface ForumSidebarProps {
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
    handleSidebarClick: () => void;
    categories: ForumCategory[];
}

export const ForumLayout = () => {
    const { categories } = useForum();
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(window.innerWidth >= 768);

    useEffect(() => {
        const handleResize = () => {
            setIsSidebarOpen(window.innerWidth >= 768);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const toggleSidebar = () => {
        setIsSidebarOpen((prev) => !prev);
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
