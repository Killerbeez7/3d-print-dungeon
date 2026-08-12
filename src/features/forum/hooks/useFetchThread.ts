import { useQuery } from "@tanstack/react-query";

import { getThreadById } from "../services/forumService";

export const useFetchThread = (threadId?: string) => {
  return useQuery({
    queryKey: ["forum-thread", threadId],
    queryFn: () => {
      if (!threadId) {
        throw new Error("Thread ID is required");
      }

      return getThreadById(threadId);
    },
    enabled: Boolean(threadId),
    staleTime: 2 * 60 * 1000,
  });
};
