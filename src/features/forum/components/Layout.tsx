import { useState } from "react";
import { Outlet } from "react-router-dom";

import { useFetchCategories } from "../hooks";
import { FORUM_CATEGORIES } from "@/config/forumCategories";

import { ForumSidebar } from "./ForumSidebar";

export const ForumLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  const { data: fetchedCategories = [] } = useFetchCategories();

  const categories = fetchedCategories.length > 0 ? fetchedCategories : FORUM_CATEGORIES;

  const toggleSidebar = () => {
    setIsSidebarOpen((current) => {
      return !current;
    });
  };

  return (
    <div className="relative flex min-h-screen bg-page">
      <ForumSidebar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        categories={categories}
        className="z-20"
      />

      <div className="min-w-0 flex-1">
        <div className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-[1400px] flex-col px-4 pb-16 pt-6 sm:px-6 lg:px-10 lg:pt-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
