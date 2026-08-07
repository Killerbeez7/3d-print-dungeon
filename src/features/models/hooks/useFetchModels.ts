import { useInfiniteQuery, InfiniteData, useQuery } from "@tanstack/react-query";
import { fetchModels, FetchModelsOptions, getModelById } from "../services/index";
import type { ModelData } from "../types/model";
import type { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";

type Page = {
  models: ModelData[];
  nextCursor?: QueryDocumentSnapshot<DocumentData>;
};

export const useFetchModel = (modelId?: string) => {
  return useQuery({
    queryKey: ["models", "detail", modelId],

    queryFn: () => {
      if (!modelId) {
        throw new Error("Model ID is required");
      }

      return getModelById(modelId);
    },

    enabled: Boolean(modelId),

    staleTime: 5 * 60 * 1000,
  });
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
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
