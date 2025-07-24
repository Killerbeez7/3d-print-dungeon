import { useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ForumContext } from "@/features/forum/context/forumContext";
import { forumService } from "@/features/forum/services/forumService";
import { FORUM_CATEGORIES } from "@/config/forumCategories";
import type {
    ForumContextValue,
    ForumCategory,
    ForumThread,
    ForumReply,
    ForumThreadsState,
    ForumPagination,
} from "@/features/forum/types/forum";

interface ForumProviderProps {
    children: ReactNode;
}

export const ForumProvider = ({ children }: ForumProviderProps) => {
    const { currentUser } = useAuth();

    // State management
    const [threads, setThreads] = useState<ForumThreadsState>({
        recent: [],
        popular: [],
        unanswered: [],
        byCategory: {},
    });
    const [currentThread, setCurrentThread] = useState<
        (ForumThread & { replies?: ForumReply[] }) | null
    >(null);
    const [currentCategory, setCurrentCategory] = useState<ForumCategory | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<ForumPagination>({
        threads: { lastVisible: null, hasMore: false },
        replies: { lastVisible: null, hasMore: false },
    });

    // Load global threads once
    useEffect(() => {
        const init = async () => {
            setLoading(true);
            try {
                const [recent, popular, unanswered] = await Promise.all([
                    forumService.getRecentThreads(),
                    forumService.getPopularThreads(),
                    forumService.getUnansweredThreads(),
                ]);
                setThreads((prev) => ({
                    ...prev,
                    recent: recent as ForumThread[],
                    popular: popular as ForumThread[],
                    unanswered: unanswered as ForumThread[],
                }));
            } catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                console.error("Error initializing forum:", msg);
                setError(msg);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    // Get a specific category from config
    const getCategory = useCallback(async (categoryId: string) => {
        setLoading(true);
        setError(null);
        try {
            const category = FORUM_CATEGORIES.find((cat) => cat.id === categoryId) as
                | ForumCategory
                | undefined;
            setCurrentCategory(category || null);
            if (!category) throw new Error("Category not found");
            return category;
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            setError(msg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Get threads by category
    const getThreadsByCategory = useCallback(
        async (categoryId: string, sortBy: string = "lastActivity") => {
            if (threads.byCategory[categoryId]) {
                return threads.byCategory[categoryId];
            }
            setLoading(true);
            setError(null);
            try {
                const result = await forumService.getThreadsByCategory(
                    categoryId,
                    sortBy
                );
                setPagination((prev) => ({
                    ...prev,
                    threads: {
                        lastVisible: result.lastVisible,
                        hasMore: result.hasMore,
                    },
                }));
                setThreads((prev) => ({
                    ...prev,
                    byCategory: {
                        ...prev.byCategory,
                        [categoryId]: result.threads as ForumThread[],
                    },
                }));
                return result.threads as ForumThread[];
            } catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                console.error("Error getting threads by category:", msg);
                setError(msg);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [threads.byCategory]
    );

    // Load more threads (pagination)
    const loadMoreThreads = useCallback(
        async (categoryId: string, sortBy: string = "lastActivity") => {
            if (!pagination.threads.hasMore || !pagination.threads.lastVisible) {
                return;
            }
            setLoading(true);
            try {
                const result = await forumService.getMoreThreadsByCategory(
                    categoryId,
                    sortBy,
                    pagination.threads.lastVisible
                );
                setPagination((prev) => ({
                    ...prev,
                    threads: {
                        lastVisible: result.lastVisible,
                        hasMore: result.hasMore,
                    },
                }));
                setThreads((prev) => ({
                    ...prev,
                    byCategory: {
                        ...prev.byCategory,
                        [categoryId]: [
                            ...(prev.byCategory[categoryId] || []),
                            ...(result.threads as ForumThread[]),
                        ],
                    },
                }));
                return result.threads as ForumThread[];
            } catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                console.error("Error loading more threads:", msg);
                setError(msg);
            } finally {
                setLoading(false);
            }
        },
        [pagination.threads]
    );

    // Get thread details
    const loadThread = useCallback(async (threadId: string) => {
        setLoading(true);
        setError(null);
        try {
            const thread = (await forumService.getThreadById(threadId)) as ForumThread;
            const result = await forumService.getThreadReplies(threadId);
            setPagination((prev) => ({
                ...prev,
                replies: {
                    lastVisible: result.lastVisible,
                    hasMore: result.hasMore,
                },
            }));
            const threadWithReplies: ForumThread & { replies?: ForumReply[] } = {
                ...thread,
                replies: result.replies as ForumReply[],
            };
            setCurrentThread(threadWithReplies);
            forumService.incrementThreadViews(threadId);
            return threadWithReplies;
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            console.error("Error loading thread:", msg);
            setError(msg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Load more replies (pagination)
    const loadMoreReplies = useCallback(
        async (threadId: string) => {
            if (!pagination.replies.hasMore || !pagination.replies.lastVisible) {
                return;
            }
            setLoading(true);
            try {
                const result = await forumService.getMoreThreadReplies(
                    threadId,
                    pagination.replies.lastVisible
                );
                setPagination((prev) => ({
                    ...prev,
                    replies: {
                        lastVisible: result.lastVisible,
                        hasMore: result.hasMore,
                    },
                }));
                setCurrentThread((prev) => {
                    if (!prev) return null;
                    return {
                        ...prev,
                        replies: [
                            ...(prev.replies || []),
                            ...(result.replies as ForumReply[]),
                        ],
                    };
                });
                return result.replies as ForumReply[];
            } catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                console.error("Error loading more replies:", msg);
                setError(msg);
            } finally {
                setLoading(false);
            }
        },
        [pagination.replies]
    );

    // Create new thread
    const createThread = useCallback(
        async (data: Partial<ForumThread>) => {
            if (!currentUser) {
                setError("You must be logged in to create a thread");
                throw new Error("Not authenticated");
            }
            setLoading(true);
            setError(null);
            try {
                // Use the new improved createThread method
                const threadId = await forumService.createThread({
                    title: data.title || "",
                    content: data.content || "",
                    categoryId: data.categoryId || "",
                    authorId: currentUser.uid,
                    authorName: currentUser.displayName || "Anonymous",
                    authorPhotoURL: currentUser.photoURL || undefined,
                    tags: data.tags || [],
                });
                
                const thread = (await forumService.getThreadById(
                    threadId
                )) as ForumThread;
                setThreads((prev) => ({
                    ...prev,
                    recent: [thread, ...prev.recent].slice(0, prev.recent.length),
                    byCategory: {
                        ...prev.byCategory,
                        [thread.categoryId]: prev.byCategory[thread.categoryId]
                            ? [thread, ...prev.byCategory[thread.categoryId]]
                            : [thread],
                    },
                }));
                return threadId;
            } catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                console.error("Error creating thread:", msg);
                setError(msg);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [currentUser]
    );

    // Add reply to thread
    const addReply = useCallback(
        async (threadId: string, content: string) => {
            if (!currentUser) throw new Error("Not authenticated");
            setLoading(true);
            setError(null);
            try {
                const replyData = {
                    content,
                    authorId: currentUser.uid,
                    authorName: currentUser.displayName || "Anonymous",
                    authorPhotoURL: currentUser.photoURL || undefined,
                };
                const replyId = await forumService.addReply(threadId, replyData);
                await loadThread(threadId);
                return replyId;
            } catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                console.error("Error adding reply:", msg);
                setError(msg);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [currentUser, loadThread]
    );

    // Update thread
    const updateThread = useCallback(
        async (threadId: string, data: Partial<ForumThread>) => {
            if (!currentUser) throw new Error("Not authenticated");
            setLoading(true);
            setError(null);
            try {
                await forumService.updateThread(threadId, data);
                setCurrentThread((prev) =>
                    prev?.id === threadId ? { ...prev, ...data } : prev
                );
                return threadId;
            } catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                console.error("Error updating thread:", msg);
                setError(msg);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [currentUser]
    );

    // Update reply
    const updateReply = useCallback(
        async (replyId: string, threadId: string, content: string) => {
            if (!currentUser) throw new Error("Not authenticated");
            setLoading(true);
            setError(null);
            try {
                await forumService.updateReply(replyId, { content });
                setCurrentThread((prev) => {
                    if (!prev) return null;
                    return {
                        ...prev,
                        replies: prev.replies
                            ? prev.replies.map((reply) =>
                                  reply.id === replyId
                                      ? {
                                            ...reply,
                                            content,
                                            isEdited: true,
                                            updatedAt: new Date(),
                                        }
                                      : reply
                              )
                            : [],
                    };
                });
                return replyId;
            } catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                console.error("Error updating reply:", msg);
                setError(msg);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [currentUser]
    );

    // Delete thread
    const deleteThread = useCallback(
        async (threadId: string) => {
            if (!currentUser) throw new Error("Not authenticated");
            setLoading(true);
            setError(null);
            try {
                await forumService.deleteThread(threadId);
                setThreads((prev) => {
                    const newState = { ...prev };
                    newState.recent = newState.recent.filter((t) => t.id !== threadId);
                    newState.popular = newState.popular.filter((t) => t.id !== threadId);
                    newState.unanswered = newState.unanswered.filter(
                        (t) => t.id !== threadId
                    );
                    // Remove from byCategory if possible
                    let categoryId: string | undefined = undefined;
                    if (currentThread && currentThread.id === threadId) {
                        categoryId = currentThread.categoryId;
                    }
                    if (categoryId && newState.byCategory[categoryId]) {
                        newState.byCategory[categoryId] = newState.byCategory[
                            categoryId
                        ].filter((t) => t.id !== threadId);
                    }
                    return newState;
                });
                if (currentThread?.id === threadId) {
                    setCurrentThread(null);
                }
                return threadId;
            } catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                console.error("Error deleting thread:", msg);
                setError(msg);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [currentUser, currentThread]
    );

    // Delete reply
    const deleteReply = useCallback(
        async (replyId: string, threadId: string) => {
            if (!currentUser) throw new Error("Not authenticated");
            setLoading(true);
            setError(null);
            try {
                await forumService.deleteReply(replyId, threadId);
                setCurrentThread((prev) => {
                    if (!prev) return null;
                    return {
                        ...prev,
                        replies: prev.replies
                            ? prev.replies.filter((reply) => reply.id !== replyId)
                            : [],
                        replyCount: prev.replyCount - 1,
                    };
                });
                return replyId;
            } catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                console.error("Error deleting reply:", msg);
                setError(msg);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [currentUser]
    );

    // Search threads (client-side substring match)
    const searchThreads = useCallback(async (searchQuery: string) => {
        if (!searchQuery) return [];
        setLoading(true);
        setError(null);
        try {
            const threads: ForumThread[] = await forumService.getRecentThreads(100);
            const lowerQuery = searchQuery.toLowerCase();
            const filtered = threads.filter(
                (thread) =>
                    thread.title && thread.title.toLowerCase().includes(lowerQuery)
            );
            return filtered;
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            console.error("Error searching threads:", msg);
            setError(msg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Get user's threads
    const getUserThreads = useCallback(async (userId: string) => {
        setLoading(true);
        setError(null);
        try {
            const result = await forumService.getUserThreads(userId);
            return result.threads as ForumThread[];
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            console.error("Error getting user threads:", msg);
            setError(msg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Get user's replies
    const getUserReplies = useCallback(async (userId: string) => {
        setLoading(true);
        setError(null);
        try {
            const result = await forumService.getUserReplies(userId);
            return result.replies as ForumReply[];
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            console.error("Error getting user replies:", msg);
            setError(msg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Clear current thread
    const clearCurrentThread = useCallback(() => {
        setCurrentThread(null);
    }, []);

    // Clear error
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Memoize context value
    const contextValue: ForumContextValue = useMemo(
        () => ({
            categories: FORUM_CATEGORIES as ForumCategory[],
            threads,
            currentThread,
            currentCategory,
            loading,
            error,
            pagination,
            getCategory,
            getThreadsByCategory,
            loadMoreThreads,
            loadThread,
            loadMoreReplies,
            createThread,
            updateThread,
            deleteThread,
            addReply,
            updateReply,
            deleteReply,
            searchThreads,
            getUserThreads,
            getUserReplies,
            clearCurrentThread,
            clearError,
        }),
        [
            threads,
            currentThread,
            currentCategory,
            loading,
            error,
            pagination,
            getCategory,
            getThreadsByCategory,
            loadMoreThreads,
            loadThread,
            loadMoreReplies,
            createThread,
            updateThread,
            deleteThread,
            addReply,
            updateReply,
            deleteReply,
            searchThreads,
            getUserThreads,
            getUserReplies,
            clearCurrentThread,
            clearError,
        ]
    );

    return <ForumContext.Provider value={contextValue}>{children}</ForumContext.Provider>;
};
