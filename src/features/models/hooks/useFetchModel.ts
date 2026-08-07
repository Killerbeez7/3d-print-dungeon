import { useQuery } from "@tanstack/react-query";
import { getModelById } from "../services/index";

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
