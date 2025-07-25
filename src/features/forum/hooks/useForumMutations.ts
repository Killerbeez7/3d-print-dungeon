import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    createThread,
    updateThread,
    deleteThread,
    createReply,
    updateReply,
    deleteReply,
    incrementThreadViews,
    CreateThreadParams,
    CreateReplyParams,
} from "../services/forumService";
import type { ForumThread } from "../types/forum";

export const useCreateThread = () => {
    const queryClient = useQueryClient();

    return useMutation<string, Error, CreateThreadParams>({
        mutationFn: createThread,
        onSuccess: () => {
            // Invalidate and refetch threads
            queryClient.invalidateQueries({ queryKey: ["forum-threads"] });
            queryClient.invalidateQueries({ queryKey: ["forum-categories"] });
        },
    });
};

export const useUpdateThread = () => {
    const queryClient = useQueryClient();

    return useMutation<string, Error, { threadId: string; data: Partial<ForumThread> }>({
        mutationFn: ({ threadId, data }) => updateThread(threadId, data),
        onSuccess: (_, { threadId }) => {
            // Invalidate specific thread and threads list
            queryClient.invalidateQueries({ queryKey: ["forum-thread", threadId] });
            queryClient.invalidateQueries({ queryKey: ["forum-threads"] });
        },
    });
};

export const useDeleteThread = () => {
    const queryClient = useQueryClient();

    return useMutation<string, Error, { threadId: string; authorId: string }>({
        mutationFn: ({ threadId, authorId }) => deleteThread(threadId, authorId),
        onSuccess: () => {
            // Invalidate all forum queries
            queryClient.invalidateQueries({ queryKey: ["forum-threads"] });
            queryClient.invalidateQueries({ queryKey: ["forum-categories"] });
        },
    });
};

export const useCreateReply = () => {
    const queryClient = useQueryClient();

    return useMutation<string, Error, CreateReplyParams>({
        mutationFn: createReply,
        onSuccess: (_, { threadId }) => {
            // Invalidate thread and replies
            queryClient.invalidateQueries({ queryKey: ["forum-thread", threadId] });
            queryClient.invalidateQueries({ queryKey: ["forum-replies", threadId] });
            queryClient.invalidateQueries({ queryKey: ["forum-threads"] });
        },
    });
};

export const useUpdateReply = () => {
    const queryClient = useQueryClient();

    return useMutation<string, Error, { replyId: string; data: Record<string, unknown>; authorId: string }>({
        mutationFn: ({ replyId, data, authorId }) => updateReply(replyId, data, authorId),
        onSuccess: () => {
            // Invalidate all replies queries
            queryClient.invalidateQueries({ queryKey: ["forum-replies"] });
        },
    });
};

export const useDeleteReply = () => {
    const queryClient = useQueryClient();

    return useMutation<string, Error, { replyId: string; threadId: string }>({
        mutationFn: ({ replyId, threadId }) => deleteReply(replyId, threadId),
        onSuccess: (_, { threadId }) => {
            // Invalidate thread and replies
            queryClient.invalidateQueries({ queryKey: ["forum-thread", threadId] });
            queryClient.invalidateQueries({ queryKey: ["forum-replies", threadId] });
            queryClient.invalidateQueries({ queryKey: ["forum-threads"] });
        },
    });
};

export const useIncrementThreadViews = () => {
    const queryClient = useQueryClient();

    return useMutation<void, Error, string>({
        mutationFn: incrementThreadViews,
        onSuccess: (_, threadId) => {
            // Invalidate specific thread
            queryClient.invalidateQueries({ queryKey: ["forum-thread", threadId] });
        },
    });
}; 