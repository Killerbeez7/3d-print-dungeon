import { useInfiniteQuery, InfiniteData, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchModels, FetchModelsOptions, getModelById } from "../services/index";
import type { ModelData } from "../types/model";
import type { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";

type Page = {
  models: ModelData[];
  nextCursor?: QueryDocumentSnapshot<DocumentData>;
};

/**
 * @param fromGallery show the listing from an already loaded gallery while
 *   the document loads (for read-only pages; never for edit forms).
 */
export const useFetchModel = (modelId?: string, { fromGallery = false } = {}) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["models", "detail", modelId],

    queryFn: () => {
      if (!modelId) {
        throw new Error("Model ID is required");
      }

      return getModelById(modelId);
    },

    enabled: Boolean(modelId),

    // Opened from a gallery: show the listing right away while the full
    // document loads.
    placeholderData: () => {
      if (!fromGallery) return undefined;
      for (const [, data] of queryClient.getQueriesData<InfiniteData<Page>>({ queryKey: ["models"] })) {
        const match = data?.pages?.flatMap((page) => page.models).find((model) => model.id === modelId);
        if (match) return match;
      }
      return undefined;
    },

    staleTime: 5 * 60 * 1000,
  });
};

export const useFetchModels = (filters: FetchModelsOptions, placeholderModels?: ModelData[]) =>
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
    placeholderData: placeholderModels
      ? { pages: [{ models: placeholderModels }], pageParams: [undefined] }
      : undefined,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
