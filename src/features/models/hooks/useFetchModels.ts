import { useInfiniteQuery, InfiniteData } from "@tanstack/react-query";
import { fetchModels, FetchModelsOptions } from "../services/index";
import type { ModelData } from "../types/model";
import type { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";

type Page = {
  models: ModelData[];
  nextCursor?: QueryDocumentSnapshot<DocumentData>;
};

export const useFetchModels = (filters: FetchModelsOptions) =>
  useInfiniteQuery<
    Page,
    Error,
    InfiniteData<Page>,
    [string, FetchModelsOptions],
    QueryDocumentSnapshot<DocumentData> | undefined
  >({
    queryKey: ["models", filters],
    queryFn: ({ pageParam }) => fetchModels({ ...filters, cursor: pageParam }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
    staleTime: 0,
  });
