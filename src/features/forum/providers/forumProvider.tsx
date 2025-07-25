import { useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ForumContext } from "@/features/forum/context/forumContext";
import {
    getRecentThreads,
    getPopularThreads,
    getUnansweredThreads,
    getThreadById,
    createThread as createThreadService,
    createReply,
    updateThread as updateThreadService,
    updateReply as updateReplyService,
    deleteThread as deleteThreadService,
    deleteReply as deleteReplyService,
    incrementThreadViews,
    fetchThreads,
    fetchReplies,
} from "@/features/forum/services/forumService";
import { FORUM_CATEGORIES } from "@/config/forumCategories";
import type {
    ForumContextValue,
    ForumCategory,
    ForumThread,
    ForumReply,
    ForumThreadsState,
    ForumPagination,
} from "@/features/forum/types/forum";
import { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";

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
                    getRecentThreads(),
                    getPopularThreads(),
                    getUnansweredThreads(),
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
        async (
            categoryId: string,
            sortBy: "createdAt" | "lastActivity" | "views" | "replyCount" = "lastActivity"
        ) => {
            if (threads.byCategory[categoryId]) {
                return threads.byCategory[categoryId];
            }
            setLoading(true);
            setError(null);
            try {
                const result = await fetchThreads({
                    categoryId,
                    sortBy,
                    limit: 20,
                });
                setPagination((prev) => ({
                    ...prev,
                    threads: {
                        lastVisible: result.nextCursor || null,
                        hasMore: !!result.nextCursor,
                    },
                }));
                setThreads((prev) => ({
                    ...prev,
                    byCategory: {
                        ...prev.byCategory,
                        [categoryId]: result.threads,
                    },
                }));
                return result.threads;
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
        async (
            categoryId: string,
            sortBy: "createdAt" | "lastActivity" | "views" | "replyCount" = "lastActivity"
        ) => {
            if (!pagination.threads.hasMore || !pagination.threads.lastVisible) {
                return;
            }
            setLoading(true);
            try {
                const result = await fetchThreads({
                    categoryId,
                    sortBy,
                    cursor: pagination.threads.lastVisible,
                    limit: 20,
                });
                setPagination((prev) => ({
                    ...prev,
                    threads: {
                        lastVisible: result.nextCursor || null,
                        hasMore: !!result.nextCursor,
                    },
                }));
                setThreads((prev) => ({
                    ...prev,
                    byCategory: {
                        ...prev.byCategory,
                        [categoryId]: [
                            ...(prev.byCategory[categoryId] || []),
                            ...result.threads,
                        ],
                    },
                }));
                return result.threads;
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
            const thread = (await getThreadById(threadId)) as ForumThread;
            const result = await fetchReplies({
                threadId,
                limit: 20,
            });
            setPagination((prev) => ({
                ...prev,
                replies: {
                    lastVisible: result.nextCursor || null,
                    hasMore: !!result.nextCursor,
                },
            }));
            const threadWithReplies: ForumThread & { replies?: ForumReply[] } = {
                ...thread,
                replies: result.replies,
            };
            setCurrentThread(threadWithReplies);
            incrementThreadViews(threadId);
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
                const result = await fetchReplies({
                    threadId,
                    cursor: pagination.replies.lastVisible,
                    limit: 20,
                });
                setPagination((prev) => ({
                    ...prev,
                    replies: {
                        lastVisible: result.nextCursor || null,
                        hasMore: !!result.nextCursor,
                    },
                }));
                setCurrentThread((prev) => {
                    if (!prev) return null;
                    return {
                        ...prev,
                        replies: [...(prev.replies || []), ...result.replies],
                    };
                });
                return result.replies;
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
        async (data: Partial<ForumThread>): Promise<string> => {
            if (!currentUser) {
                setError("You must be logged in to create a thread");
                throw new Error("Not authenticated");
            }
            setLoading(true);
            setError(null);
            try {
                // Validate required fields before calling service
                if (!data.title?.trim()) {
                    throw new Error("Thread title is required");
                }
                if (!data.content?.trim()) {
                    throw new Error("Thread content is required");
                }
                if (!data.categoryId) {
                    throw new Error("Category is required");
                }

                // Use the service createThread method
                const threadId = await createThreadService({
                    title: data.title.trim(),
                    content: data.content.trim(),
                    categoryId: data.categoryId,
                    authorId: currentUser.uid,
                    authorName: currentUser.displayName || "Anonymous",
                    authorPhotoURL: currentUser.photoURL || undefined,
                    tags: data.tags || [],
                });

                const thread = await getThreadById(threadId);
                setThreads((prev) => ({
                    ...prev,
                    recent: [thread, ...(prev.recent || [])].slice(0, 10), // Keep only 10 most recent
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
                // Validate required fields before calling service
                if (!content?.trim()) {
                    throw new Error("Reply content is required");
                }
                if (!threadId) {
                    throw new Error("Thread ID is required");
                }

                const replyData = {
                    content: content.trim(),
                    authorId: currentUser.uid,
                    authorName: currentUser.displayName || "Anonymous",
                    authorPhotoURL: currentUser.photoURL || undefined,
                };
                const replyId = await createReply({
                    threadId,
                    content: replyData.content,
                    authorId: replyData.authorId,
                    authorName: replyData.authorName,
                    authorPhotoURL: replyData.authorPhotoURL,
                });

                // Refresh the current thread
                await loadThread(threadId);

                // Update global thread lists to reflect the new reply
                setThreads((prev) => {
                    const updatedThreads = { ...prev };

                    // Remove from unanswered list since it now has a reply
                    updatedThreads.unanswered = prev.unanswered.filter(
                        (thread) => thread.id !== threadId
                    );

                    // Update recent threads (the thread will move to top due to lastActivity update)
                    const updatedRecent = prev.recent.map((thread) =>
                        thread.id === threadId
                            ? { ...thread, replyCount: (thread.replyCount || 0) + 1 }
                            : thread
                    );
                    updatedThreads.recent = updatedRecent;

                    // Update popular threads
                    const updatedPopular = prev.popular.map((thread) =>
                        thread.id === threadId
                            ? { ...thread, replyCount: (thread.replyCount || 0) + 1 }
                            : thread
                    );
                    updatedThreads.popular = updatedPopular;

                    // Update category-specific threads
                    Object.keys(updatedThreads.byCategory).forEach((categoryId) => {
                        updatedThreads.byCategory[categoryId] = updatedThreads.byCategory[
                            categoryId
                        ].map((thread) =>
                            thread.id === threadId
                                ? { ...thread, replyCount: (thread.replyCount || 0) + 1 }
                                : thread
                        );
                    });

                    return updatedThreads;
                });

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
                await updateThreadService(threadId, data);
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
                await updateReplyService(replyId, { content }, currentUser.uid);
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
                await deleteThreadService(threadId, currentUser.uid);
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
                await deleteReplyService(replyId, threadId);
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
            const threads: ForumThread[] = await getRecentThreads(100);
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

    // Get user's threads - placeholder implementation
    const getUserThreads = useCallback(
        async (
            userId: string,
            sortBy: "createdAt" | "lastActivity" | "views" | "replyCount" = "createdAt",
            sortOrder: "asc" | "desc" = "desc",
            pageSize: number = 20,
            lastVisible?: unknown
        ) => {
            setLoading(true);
            setError(null);
            try {
                // TODO: Implement getUserThreads in forumService
                const result = await fetchThreads({
                    authorId: userId,
                    sortBy,
                    sortOrder,
                    limit: pageSize,
                    cursor: lastVisible as QueryDocumentSnapshot<DocumentData>,
                });
                return result.threads;
            } catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                console.error("Error getting user threads:", msg);
                setError(msg);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    // Get user's threads with filter - placeholder implementation
    const getUserThreadsWithFilter = useCallback(
        async (
            userId: string,
            filter: "all" | "recent" | "popular" | "unanswered" | "pinned" = "all",
            sortBy: "createdAt" | "lastActivity" | "views" | "replyCount" = "createdAt",
            sortOrder: "asc" | "desc" = "desc",
            pageSize: number = 50
        ) => {
            setLoading(true);
            setError(null);
            try {
                // TODO: Implement getUserThreadsWithFilter in forumService
                const result = await fetchThreads({
                    authorId: userId,
                    filter,
                    sortBy,
                    sortOrder,
                    limit: pageSize,
                });
                return result.threads;
            } catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                console.error("Error getting filtered user threads:", msg);
                setError(msg);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    // Get user's replies - placeholder implementation
    const getUserReplies = useCallback(async (userId: string) => {
        setLoading(true);
        setError(null);
        try {
            // TODO: Implement getUserReplies in forumService
            // For now, return empty array
            console.log("Getting replies for user:", userId);
            return [] as ForumReply[];
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
            getUserThreadsWithFilter,
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
            getUserThreadsWithFilter,
            getUserReplies,
            clearCurrentThread,
            clearError,
        ]
    );

    return <ForumContext.Provider value={contextValue}>{children}</ForumContext.Provider>;
};
