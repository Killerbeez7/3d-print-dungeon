import { createContext } from "react";

export interface Comment {
    id: string;
    text: string;
    userId: string;
    userName: string;
    createdAt?: { toDate: () => Date };
}

export interface CommentsContextType {
    comments: Comment[];
    loading: boolean;
    submitComment: (commentData: Omit<Comment, "id" | "createdAt">) => Promise<void>;
    removeComment: (commentId: string) => Promise<void>;
    updateComment: (commentId: string, newData: Partial<Pick<Comment, "text">>) => Promise<void>;
}

export const CommentsContext = createContext<CommentsContextType>({
    comments: [],
    loading: false,
    submitComment: async () => Promise.resolve(),
    removeComment: async () => Promise.resolve(),
    updateComment: async () => Promise.resolve(),
}); 