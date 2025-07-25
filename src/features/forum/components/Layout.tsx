import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useForum } from "@/features/forum/hooks/useForum";
import { ForumSidebar } from "./ForumSidebar";
import type { FC } from "react";
import { useScreenSize } from "@/hooks/useScreenSize";

// Custom hook to get responsive padding values
const useResponsivePadding = (isSidebarOpen: boolean) => {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    if (windowWidth <= 768) {
        return { paddingLeft: "0", paddingRight: "0" };
    }
    if (windowWidth <= 1000) {
        return { paddingLeft: "50px", paddingRight: "50px" };
    } else if (windowWidth <= 1200) {
        return {
            paddingLeft: isSidebarOpen ? "100px" : "100px",
            paddingRight: isSidebarOpen ? "400px" : "170px",
        };
    } else {
        return {
            paddingLeft: isSidebarOpen ? "200px" : "200px",
            paddingRight: isSidebarOpen ? "500px" : "270px",
        };
    }
};

export const ForumLayout: FC = () => {
    const { categories } = useForum();
    const { isTablet } = useScreenSize();
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
    const responsivePadding = useResponsivePadding(isSidebarOpen);

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
                style={responsivePadding}
            >
                <Outlet />
            </div>
        </div>
    );
};
