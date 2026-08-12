import { useQuery } from "@tanstack/react-query";

import { getUserReplies } from "../services/forumService";

export const useFetchUserReplies = (userId?: string) => {
  return useQuery({
    queryKey: ["forum-replies", "user", userId],

    queryFn: () => {
      if (!userId) {
        throw new Error("User ID is required");
      }

      return getUserReplies(userId, 20);
    },

    enabled: Boolean(userId),
    staleTime: 0,
  });
};
