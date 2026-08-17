import { useState } from "react";
import { Outlet } from "react-router-dom";

import { useFetchCategories } from "../hooks";
import { FORUM_CATEGORIES } from "@/config/forumCategories";

import { ForumSidebar, FORUM_EXPANDED_WIDTH, FORUM_RAIL_WIDTH } from "./ForumSidebar";

export const ForumLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  const { data: fetchedCategories = [] } = useFetchCategories();

  const categories = fetchedCategories.length > 0 ? fetchedCategories : FORUM_CATEGORIES;

  const toggleSidebar = () => {
    setIsSidebarOpen((current) => {
      return !current;
    });
  };

  const sidebarWidth = isSidebarOpen ? FORUM_EXPANDED_WIDTH : FORUM_RAIL_WIDTH;

  return (
    <div className="relative flex min-h-screen bg-page">
      <ForumSidebar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        categories={categories}
        className="z-20"
      />

      <main className="min-w-0 flex-1">
        <div
          className="flex min-h-[calc(100vh-80px)] w-full flex-col px-4 pt-4 pb-8 transition-[padding] duration-200 ease-out md:px-8 lg:px-10"
          style={{
            paddingLeft:
              sidebarWidth > FORUM_RAIL_WIDTH ? "clamp(2rem, 3vw, 3rem)" : undefined,
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
