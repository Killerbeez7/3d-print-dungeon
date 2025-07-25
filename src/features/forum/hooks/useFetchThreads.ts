import { useInfiniteQuery, InfiniteData } from "@tanstack/react-query";
import { fetchThreads, FetchThreadsOptions } from "../services/forumService";
import type { ForumThread } from "../types/forum";
import type { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";

type Page = {
    threads: ForumThread[];
    nextCursor?: QueryDocumentSnapshot<DocumentData>;
};

export const useFetchThreads = (filters: FetchThreadsOptions) =>
    useInfiniteQuery<
        Page,
        Error,
        InfiniteData<Page>,
        [string, FetchThreadsOptions],
        QueryDocumentSnapshot<DocumentData> | undefined
    >({
        queryKey: ["forum-threads", filters],
        queryFn: ({ pageParam }) => fetchThreads({ ...filters, cursor: pageParam }),
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        initialPageParam: undefined,
        staleTime: 0,
    }); 