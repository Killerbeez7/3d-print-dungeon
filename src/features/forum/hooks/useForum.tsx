import { useContext } from "react";
import { ForumContext, ForumContextType } from "@/features/forum/context/forumContext";

export const useForum = (): ForumContextType => {
    const context = useContext(ForumContext);
    if (context === undefined) {
        throw new Error("useForum must be used within a ForumProvider");
    }
    return context;
};
