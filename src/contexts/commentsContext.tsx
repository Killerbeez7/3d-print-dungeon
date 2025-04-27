import { createContext } from "react";

export const CommentsContext = createContext({
    comments: [],
    loading: false,
    submitComment: () => {},
    removeComment: () => {},
    updateComment: () => {},
    fetchComments: () => {},
}); 