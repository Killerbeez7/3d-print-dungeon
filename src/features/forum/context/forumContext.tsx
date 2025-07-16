import { createContext } from "react";
import type { ForumContextValue } from "@/features/forum/types/forum";

export type ForumContextType = ForumContextValue;

const noop = () => { throw new Error("ForumContext: Not implemented") };

export const ForumContext = createContext<ForumContextType>({
    categories: [],
    threads: { recent: [], popular: [], unanswered: [], byCategory: {} },
    currentThread: null,
    currentCategory: null,
    loading: false,
    error: null,
    pagination: { threads: { lastVisible: null, hasMore: false }, replies: { lastVisible: null, hasMore: false } },
    getCategory: async () => { throw new Error("getCategory not implemented") },
    getThreadsByCategory: async () => [],
    loadMoreThreads: async () => [],
    loadThread: async () => { throw new Error("loadThread not implemented") },
    loadMoreReplies: async () => [],
    createThread: async () => { throw new Error("createThread not implemented") },
    updateThread: async () => { throw new Error("updateThread not implemented") },
    deleteThread: async () => { throw new Error("deleteThread not implemented") },
    addReply: async () => { throw new Error("addReply not implemented") },
    updateReply: async () => { throw new Error("updateReply not implemented") },
    deleteReply: async () => { throw new Error("deleteReply not implemented") },
    searchThreads: async () => [],
    getUserThreads: async () => [],
    getUserReplies: async () => [],
    clearCurrentThread: noop,
    clearError: noop,
}); 