import { useState, useEffect, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import { useAuth } from "../hooks/useAuth";
import { ForumContext } from "../contexts/forumContext";
import { forumService } from "../services/forumService";
import { FORUM_CATEGORIES } from "@/config/forumCategories";

export const ForumProvider = ({ children }) => {
    const { currentUser } = useAuth();

    // State management
    const [threads, setThreads] = useState({
        recent: [],
        popular: [],
        unanswered: [],
        byCategory: {},
    });
    const [currentThread, setCurrentThread] = useState(null);
    const [currentCategory, setCurrentCategory] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        threads: {
            lastVisible: null,
            hasMore: false,
        },
        replies: {
            lastVisible: null,
            hasMore: false,
        },
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
                setThreads((prev) => ({ ...prev, recent, popular, unanswered }));
            } catch (err) {
                console.error("Error initializing forum:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    // Get a specific category from config
    const getCategory = useCallback(async (categoryId) => {
        setLoading(true);
        setError(null);
        try {
            const category = FORUM_CATEGORIES.find((cat) => cat.id === categoryId);
            setCurrentCategory(category || null);
            if (!category) throw new Error("Category not found");
            return category;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Get threads by category
    const getThreadsByCategory = useCallback(
        async (categoryId, sortBy = "lastActivity") => {
            // Check if we already have the threads for this category and return them if not
            // stale (implementation may vary depending on your caching strategy)
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
                        [categoryId]: result.threads,
                    },
                }));

                return result.threads;
            } catch (err) {
                console.error("Error getting threads by category:", err);
                setError(err.message);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [threads.byCategory]
    );

    // Load more threads (pagination)
    const loadMoreThreads = useCallback(
        async (categoryId, sortBy = "lastActivity") => {
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
                            ...result.threads,
                        ],
                    },
                }));

                return result.threads;
            } catch (err) {
                console.error("Error loading more threads:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        },
        [pagination.threads]
    );

    // Get thread details
    const loadThread = useCallback(async (threadId) => {
        setLoading(true);
        setError(null);
        try {
            const thread = await forumService.getThreadById(threadId);
            const result = await forumService.getThreadReplies(threadId);

            setPagination((prev) => ({
                ...prev,
                replies: {
                    lastVisible: result.lastVisible,
                    hasMore: result.hasMore,
                },
            }));

            const threadWithReplies = {
                ...thread,
                replies: result.replies,
            };

            setCurrentThread(threadWithReplies);

            // Increment views
            forumService.incrementThreadViews(threadId);

            return threadWithReplies;
        } catch (err) {
            console.error("Error loading thread:", err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Load more replies (pagination)
    const loadMoreReplies = useCallback(
        async (threadId) => {
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
                        replies: [...(prev.replies || []), ...result.replies],
                    };
                });

                return result.replies;
            } catch (err) {
                console.error("Error loading more replies:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        },
        [pagination.replies]
    );

    // Create new thread
    const createThread = useCallback(
        async (data) => {
            if (!currentUser) {
                setError("You must be logged in to create a thread");
            }

            setLoading(true);
            setError(null);
            try {
                const threadData = {
                    ...data,
                    authorId: currentUser.uid,
                    authorName: currentUser.displayName || "Anonymous",
                    authorPhotoURL: currentUser.photoURL || null,
                };

                const threadId = await forumService.createThread(threadData);

                // Update local thread lists with the new thread
                const thread = await forumService.getThreadById(threadId);

                // Update recent threads
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
                console.error("Error creating thread:", err);
                setError(err.message);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [currentUser]
    );

    // Add reply to thread
    const addReply = useCallback(
        async (threadId, content) => {
            if (!currentUser) throw new Error("Not authenticated");

            setLoading(true);
            setError(null);
            try {
                const replyData = {
                    content,
                    authorId: currentUser.uid,
                    authorName: currentUser.displayName || "Anonymous",
                    authorPhotoURL: currentUser.photoURL || null,
                };

                const replyId = await forumService.addReply(threadId, replyData);

                // Get fresh thread data after reply
                await loadThread(threadId);

                return replyId;
            } catch (err) {
                console.error("Error adding reply:", err);
                setError(err.message);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [currentUser, loadThread]
    );

    // Update thread
    const updateThread = useCallback(
        async (threadId, data) => {
            if (!currentUser) throw new Error("Not authenticated");

            setLoading(true);
            setError(null);
            try {
                await forumService.updateThread(threadId, data);

                // Update local thread state
                setCurrentThread((prev) =>
                    prev?.id === threadId ? { ...prev, ...data } : prev
                );

                return threadId;
            } catch (err) {
                console.error("Error updating thread:", err);
                setError(err.message);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [currentUser]
    );

    // Update reply
    const updateReply = useCallback(
        async (replyId, threadId, content) => {
            if (!currentUser) throw new Error("Not authenticated");

            setLoading(true);
            setError(null);
            try {
                await forumService.updateReply(replyId, { content });

                // Update local reply state
                setCurrentThread((prev) => {
                    if (!prev) return null;

                    return {
                        ...prev,
                        replies: prev.replies.map((reply) =>
                            reply.id === replyId
                                ? {
                                      ...reply,
                                      content,
                                      isEdited: true,
                                      updatedAt: new Date(),
                                  }
                                : reply
                        ),
                    };
                });

                return replyId;
            } catch (err) {
                console.error("Error updating reply:", err);
                setError(err.message);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [currentUser]
    );

    // Delete thread
    const deleteThread = useCallback(
        async (threadId, categoryId) => {
            if (!currentUser) throw new Error("Not authenticated");

            setLoading(true);
            setError(null);
            try {
                await forumService.deleteThread(threadId, categoryId);

                // Update local thread lists
                setThreads((prev) => {
                    const newState = { ...prev };

                    // Remove from recent threads
                    newState.recent = newState.recent.filter((t) => t.id !== threadId);

                    // Remove from popular threads
                    newState.popular = newState.popular.filter((t) => t.id !== threadId);

                    // Remove from unanswered threads
                    newState.unanswered = newState.unanswered.filter(
                        (t) => t.id !== threadId
                    );

                    // Remove from category threads
                    if (newState.byCategory[categoryId]) {
                        newState.byCategory[categoryId] = newState.byCategory[
                            categoryId
                        ].filter((t) => t.id !== threadId);
                    }

                    return newState;
                });

                // If we're viewing this thread, clear it
                if (currentThread?.id === threadId) {
                    setCurrentThread(null);
                }

                return threadId;
            } catch (err) {
                console.error("Error deleting thread:", err);
                setError(err.message);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [currentUser, currentThread]
    );

    // Delete reply
    const deleteReply = useCallback(
        async (replyId, threadId) => {
            if (!currentUser) throw new Error("Not authenticated");

            setLoading(true);
            setError(null);
            try {
                await forumService.deleteReply(replyId, threadId);

                // Update local reply state
                setCurrentThread((prev) => {
                    if (!prev) return null;

                    return {
                        ...prev,
                        replies: prev.replies.filter((reply) => reply.id !== replyId),
                        replyCount: prev.replyCount - 1,
                    };
                });

                return replyId;
            } catch (err) {
                console.error("Error deleting reply:", err);
                setError(err.message);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [currentUser]
    );

    // Search threads
    const searchThreads = useCallback(async (searchQuery) => {
        if (!searchQuery) return [];

        setLoading(true);
        setError(null);
        try {
            const result = await forumService.searchThreads(searchQuery);
            return result.threads;
        } catch (err) {
            console.error("Error searching threads:", err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Get user's threads
    const getUserThreads = useCallback(async (userId) => {
        setLoading(true);
        setError(null);
        try {
            const result = await forumService.getUserThreads(userId);
            return result.threads;
        } catch (err) {
            console.error("Error getting user threads:", err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Get user's replies
    const getUserReplies = useCallback(async (userId) => {
        setLoading(true);
        setError(null);
        try {
            const result = await forumService.getUserReplies(userId);
            return result.replies;
        } catch (err) {
            console.error("Error getting user replies:", err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Clear current thread (when navigating away)
    const clearCurrentThread = useCallback(() => {
        setCurrentThread(null);
    }, []);

    // Clear error
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Memoize context value
    const contextValue = useMemo(
        () => ({
            // State
            categories: FORUM_CATEGORIES,
            threads,
            currentThread,
            currentCategory,
            loading,
            error,
            pagination,

            // Actions
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
        [threads, currentThread, currentCategory, loading, error, pagination, getCategory, getThreadsByCategory, loadMoreThreads, loadThread, loadMoreReplies, createThread, updateThread, deleteThread, addReply, updateReply, deleteReply, searchThreads, getUserThreads, getUserReplies, clearCurrentThread, clearError]
    );

    return <ForumContext.Provider value={contextValue}>{children}</ForumContext.Provider>;
};

ForumProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
