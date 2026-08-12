import { useInfiniteQuery, type InfiniteData } from "@tanstack/react-query";
import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";

import { fetchThreads } from "../services/forumService";
import type { FetchThreadsOptions, ForumThread } from "../types/forum";

interface ForumThreadsPage {
  threads: ForumThread[];
  nextCursor?: QueryDocumentSnapshot<DocumentData>;
}

export const useFetchThreads = (filters: FetchThreadsOptions = {}) => {
  return useInfiniteQuery<
    ForumThreadsPage,
    Error,
    InfiniteData<ForumThreadsPage>,
    [string, FetchThreadsOptions],
    QueryDocumentSnapshot<DocumentData> | undefined
  >({
    queryKey: ["forum-threads", filters],

    queryFn: ({ pageParam }) => {
      return fetchThreads({
        ...filters,
        cursor: pageParam,
      });
    },

    getNextPageParam: (lastPage) => {
      return lastPage.nextCursor;
    },

    initialPageParam: undefined,
    staleTime: 0,
  });
};
