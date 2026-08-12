import { useQuery } from "@tanstack/react-query";

import { fetchThreads } from "../services/forumService";

export const useFetchUserThreads = (userId?: string) => {
  return useQuery({
    queryKey: ["forum-threads", "user", userId],

    queryFn: async () => {
      if (!userId) {
        throw new Error("User ID is required");
      }

      const result = await fetchThreads({
        authorId: userId,
        sortBy: "createdAt",
        sortOrder: "desc",
        limit: 50,
      });

      return result.threads;
    },

    enabled: Boolean(userId),
    staleTime: 0,
  });
};
