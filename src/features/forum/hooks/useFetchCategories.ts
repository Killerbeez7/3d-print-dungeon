import { useQuery } from "@tanstack/react-query";

import { getCategories } from "../services/forumService";

export const useFetchCategories = () => {
  return useQuery({
    queryKey: ["forum-categories"],
    queryFn: getCategories,
    staleTime: 5 * 60 * 1000,
  });
};
