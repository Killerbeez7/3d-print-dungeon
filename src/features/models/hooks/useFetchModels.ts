import { useInfiniteQuery, InfiniteData } from "@tanstack/react-query";
import { fetchModels } from "../services/modelsService";
import type { ModelData } from "../types/model";
import type { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";

type FetchModelsResponse = {
  models: ModelData[];
  nextCursor?: QueryDocumentSnapshot<DocumentData>;
};

export const useFetchModels = () => {
  return useInfiniteQuery<
    FetchModelsResponse,
    Error,
    InfiniteData<FetchModelsResponse>,
    string[],
    QueryDocumentSnapshot<DocumentData> | undefined
  >({
    queryKey: ["models"],
    queryFn: ({ pageParam }) => fetchModels(pageParam),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
    staleTime: 0,
  });};
