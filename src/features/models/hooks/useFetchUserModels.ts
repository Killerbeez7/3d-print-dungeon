import { useFetchModels } from "./useFetchModels";
import type { ModelData } from "../types/model";

export const useFetchUserModels = (userId: string) => {
    const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useFetchModels({
        uploaderId: userId, // Automatically filter by this user's models
    });

    // Flatten the paginated data into a single array
    const userModels = data?.pages.flatMap((page) => page.models) ?? [];

    return {
        models: userModels,
        isLoading,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    };
};
