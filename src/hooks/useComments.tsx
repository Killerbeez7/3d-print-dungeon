import { useContext } from "react";
import { CommentsContext, CommentsContextType } from "../contexts/commentsContext";

export const useComments = (): CommentsContextType => {
    const context = useContext(CommentsContext);
    if (context === undefined) {
        throw new Error("useComments must be used within a CommentsProvider");
    }
    return context;
};