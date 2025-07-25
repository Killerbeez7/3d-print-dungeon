import { useQuery } from "@tanstack/react-query";
import { getCategories } from "../services/forumService";
import type { ForumCategory } from "../types/forum";

export const useFetchCategories = () =>
    useQuery<ForumCategory[], Error>({
        queryKey: ["forum-categories"],
        queryFn: getCategories,
        staleTime: 5 * 60 * 1000, // 5 minutes
    }); 