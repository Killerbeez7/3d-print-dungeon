import { useQuery } from "@tanstack/react-query";
import { getThreadById } from "../services/forumService";
import type { ForumThread } from "../types/forum";

export const useFetchThread = (threadId: string) =>
    useQuery<ForumThread, Error>({
        queryKey: ["forum-thread", threadId],
        queryFn: () => getThreadById(threadId),
        enabled: !!threadId,
        staleTime: 2 * 60 * 1000, // 2 minutes
    }); 