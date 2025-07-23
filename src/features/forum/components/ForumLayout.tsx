import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useForum } from "@/features/forum/hooks/useForum";
import { ForumSidebar } from "./ForumSidebar";
import type { ForumCategory } from "@/features/forum/types/forum";

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
        // Disable body scroll when sidebar is open on mobile
        if (isSidebarOpen && window.innerWidth < 768) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        // Cleanup on unmount
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isSidebarOpen]);

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
                className={`flex-1 mt-2 p-4 transition-all duration-300 ease-in-out ${
                    isSidebarOpen 
                        ? "md:ml-[300px] ml-[60px]" 
                        : "ml-[60px]"
                }`}
            >
                <Outlet />
            </div>
        </div>
    );
};
