import { useInfiniteQuery, InfiniteData } from "@tanstack/react-query";
import { fetchReplies } from "../services/forumService";
import type { ForumReply } from "../types/forum";
import type { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";

type Page = {
    replies: ForumReply[];
    nextCursor?: QueryDocumentSnapshot<DocumentData>;
};

export const useFetchReplies = (threadId: string, limit?: number) =>
    useInfiniteQuery<
        Page,
        Error,
        InfiniteData<Page>,
        [string, string, number | undefined],
        QueryDocumentSnapshot<DocumentData> | undefined
    >({
        queryKey: ["forum-replies", threadId, limit],
        queryFn: ({ pageParam }) => fetchReplies({ 
            threadId, 
            limit, 
            cursor: pageParam 
        }),
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        initialPageParam: undefined,
        staleTime: 0,
    }); 