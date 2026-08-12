import { useInfiniteQuery, type InfiniteData } from "@tanstack/react-query";
import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";

import { fetchReplies } from "../services/forumService";
import type { ForumReply } from "../types/forum";

interface ForumRepliesPage {
  replies: ForumReply[];
  nextCursor?: QueryDocumentSnapshot<DocumentData>;
}

export const useFetchReplies = (threadId?: string, limit?: number) => {
  return useInfiniteQuery<
    ForumRepliesPage,
    Error,
    InfiniteData<ForumRepliesPage>,
    [string, string | undefined, number | undefined],
    QueryDocumentSnapshot<DocumentData> | undefined
  >({
    queryKey: ["forum-replies", threadId, limit],

    queryFn: ({ pageParam }) => {
      if (!threadId) {
        throw new Error("Thread ID is required");
      }

      return fetchReplies({
        threadId,
        limit,
        cursor: pageParam,
      });
    },

    getNextPageParam: (lastPage) => {
      return lastPage.nextCursor;
    },

    initialPageParam: undefined,
    enabled: Boolean(threadId),
    staleTime: 0,
  });
};
