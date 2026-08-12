import { useQuery } from "@tanstack/react-query";
import { getReplyById } from "../services/forumService";

export const useFetchReply = (replyId?: string) => {
  return useQuery({
    queryKey: ["forum-reply", replyId],

    queryFn: () => {
      if (!replyId) {
        throw new Error("Reply ID is required");
      }

      return getReplyById(replyId);
    },

    enabled: Boolean(replyId),
    staleTime: 0,
  });
};
