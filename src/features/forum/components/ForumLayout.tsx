import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useForum } from "@/features/forum/hooks/useForum";
import { ForumSidebar } from "./ForumSidebar";

import { useScreenSize } from "@/hooks/useScreenSize";

export const ForumLayout = () => {
    const { categories } = useForum();
    const { isTablet } = useScreenSize();
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

    // Disable body scroll when sidebar is open on mobile
    useEffect(() => {
        if (isSidebarOpen && isTablet) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }

        // Cleanup on unmount
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isSidebarOpen, isTablet]);

    const toggleSidebar = () => {
        setIsSidebarOpen((prev) => !prev);
    };

    const handleSidebarClick = () => {
        if (isTablet) {
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
                className={`hidden md:flex z-[2]`}
            />
            {/* Main content */}
            <div
                className={`flex-2 p-4 pb-[20rem] transition-all duration-300 ease-in-out ${
                    isSidebarOpen ? "md:ml-[300px] ml-0" : "md:ml-[70px] ml-0"
                }`}
                // style={{ paddingLeft: "20rem", paddingRight: "calc(20rem + 70px)" }}
            >
                <Outlet />
            </div>
        </div>
    );
};
