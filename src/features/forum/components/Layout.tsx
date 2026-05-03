import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useForum } from "@/features/forum/hooks/useForum";
import {
    ForumSidebar,
    FORUM_EXPANDED_WIDTH,
    FORUM_RAIL_WIDTH,
} from "./ForumSidebar";
import type { FC } from "react";

export const ForumLayout: FC = () => {
    const { categories } = useForum();
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

    const toggleSidebar = () => {
        setIsSidebarOpen((prev) => !prev);
    };

    const sidebarWidth = isSidebarOpen
        ? FORUM_EXPANDED_WIDTH
        : FORUM_RAIL_WIDTH;

    return (
        <div className="relative flex min-h-screen bg-[var(--bg-page)]">
            <ForumSidebar
                isSidebarOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
                handleSidebarClick={() => undefined}
                categories={categories}
                className="z-20"
            />

<main className="min-w-0 flex-1">
    <div
        className="flex min-h-[calc(100vh-80px)] w-full flex-col px-4 pt-4 pb-8 transition-[padding] duration-200 ease-out md:px-8 lg:px-10"
                    style={{
                    
                        paddingLeft:
                            sidebarWidth > FORUM_RAIL_WIDTH
                                ? "clamp(2rem, 3vw, 3rem)"
                                : undefined,
                    }}
                >
                   <div className="mx-auto flex min-h-full w-full max-w-[1400px] flex-col">
    <Outlet />
</div>
                </div>
            </main>
        </div>
    );
};