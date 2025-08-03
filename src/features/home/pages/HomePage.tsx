import { FeaturedCarousel } from "../components/FeaturedCarousel";
import { featuredMockData } from "../components/featuredMockData";

import { InfiniteScrollList } from "@/features/shared/InfiniteScrollList";
import { useFetchModels } from "@/features/models/hooks/useFetchModels";

import { HomeModelsGrid } from "../components/HomeModelsGrid";
import { Spinner } from "@/features/shared/reusable/Spinner";

import { useState, useCallback, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLayout } from "@/features/shared/context/layoutContext";

export const HomePage = (): React.ReactNode => {
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } =
        useFetchModels({});

    const queryClient = useQueryClient();

    // Clear models cache whenever route changes away from home
    useEffect(() => {
        return () => {
            queryClient.removeQueries({
                predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === "models",
            });
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
            <section className="px-4 md:px-8">
                <h4 className="text-xl font-black mb-6 px-2">ALL MODELS</h4>
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
                        <HomeModelsGrid
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
