import { createContext } from "react";

export const ForumContext = createContext({
    categories: [],
    threads: [],
    currentThread: null,
    currentCategory: null,
    loading: false,
    error: null,
}); 