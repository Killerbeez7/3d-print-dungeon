import { FeaturedCarousel } from "../components/FeaturedCarousel";
import { featuredMockData } from "../components/featuredMockData";

import { InfiniteScrollList } from "@/features/shared/InfiniteScrollList";
import { useFetchModels } from "@/features/models/hooks/useFetchModels";

import { ModelsListGrid } from "./ModelsListGrid";
import { Spinner } from "@/features/shared/reusable/Spinner";

import { useState, useCallback, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLayout } from "@/features/shared/context/layoutContext";

export const HomePage = (): React.ReactNode => {
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } =
        useFetchModels();

    const queryClient = useQueryClient();

    useEffect(() => {
        // Cleanup function to remove the query cache on unmount
        return () => {
            console.log("HomePage unmounting: removing 'models' query from cache.");
            queryClient.removeQueries({ queryKey: ["models"], exact: true });
        };
    }, [queryClient]);

    const { hideFooter } = useLayout();

    useEffect(() => {
        hideFooter(hasNextPage ?? false);
        // Reset on component unmount
        return () => hideFooter(false);
    }, [hasNextPage, hideFooter]);

    const [loadIndex, setLoadIndex] = useState<number>(0);
    const bumpIndex = useCallback(() => setLoadIndex((i) => i + 1), []);

    const models = data?.pages.flatMap((page) => page.models) ?? [];

    const showSpinner = () => {
        return (
            <div className="col-span-full flex justify-center py-10">
                <Spinner size={24} />
            </div>
        );
    };

    if (isError)
        return <div className="text-center text-red-500">Error loading models.</div>;

    return (
        <div className="text-txt-primary min-h-screen">
            <FeaturedCarousel
                items={featuredMockData}
                itemHeight={180}
                slidesToShow={5}
            />
            <section className="p-4 md:p-8">
                <h1 className="text-2xl font-bold mb-6">Discover 3D Models</h1>
                <InfiniteScrollList
                    items={models}
                    hasMore={hasNextPage}
                    loadMore={fetchNextPage}
                    isLoading={isFetchingNextPage}
                    loader={showSpinner()}
                >
                    {isLoading && !models.length ? (
                        showSpinner()
                    ) : (
                        <ModelsListGrid
                            models={models}
                            loadIndex={loadIndex}
                            bumpIndex={bumpIndex}
                        />
                    )}
                </InfiniteScrollList>
            </section>
        </div>
    );
};
