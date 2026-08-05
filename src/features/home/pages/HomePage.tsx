import { FeaturedCarousel } from "../components/FeaturedCarousel";
import { featuredCarouselItems } from "../mock/carouselData";

import { InfiniteScrollList } from "@/features/shared/InfiniteScrollList";
import { useFetchModels } from "@/features/models/hooks/index";

import { HomeModelsGrid } from "../components/HomeModelsGrid";
import { Spinner } from "@/features/shared/reusable/Spinner";
import { H3 } from "@/components/ResponsiveHeading";

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

  if (isError) return <div className="text-center text-error">Error loading models.</div>;

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg-primary text-txt-primary">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_at_top,rgba(var(--accent-rgb),0.08),transparent_62%)] opacity-80"
        aria-hidden="true"
      />
      <div className="relative">
        <FeaturedCarousel items={featuredCarouselItems} />
      </div>
      <section className="relative px-4 pb-12 pt-8 md:px-6 md:pt-10 lg:px-8">
        <div className="mb-6 border-t border-br-subtle/70 pt-7">
          <H3 size="2xl" className="leading-tight">
            All Models
          </H3>
        </div>
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
            <HomeModelsGrid models={models} loadIndex={loadIndex} bumpIndex={bumpIndex} />
          )}
        </InfiniteScrollList>
      </section>
    </div>
  );
};
