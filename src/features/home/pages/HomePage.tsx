import { useCallback, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";

import { Button } from "@/components";
import { useFetchModels } from "@/features/models/hooks/index";
import { MODEL_CATEGORIES } from "@/features/models/constants/modelCategories";
import { InfiniteScrollList } from "@/features/shared/InfiniteScrollList";
import { useLayout } from "@/features/shared/context/layoutContext";
import { Spinner } from "@/features/shared/reusable/Spinner";

import { CategoryChips } from "../components/CategoryChips";
import { HomeHero } from "../components/HomeHero";
import { HomeModelsGrid, HomeModelsGridSkeleton } from "../components/HomeModelsGrid";

const CATEGORY_PARAM = "category";

export const HomePage = (): React.ReactNode => {
  const [searchParams, setSearchParams] = useSearchParams();
  const category =
    MODEL_CATEGORIES.find((item) => item.id === searchParams.get(CATEGORY_PARAM)) ?? null;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, refetch } =
    useFetchModels(category ? { categoryIds: [category.id] } : {});

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

    return () => hideFooter(false);
  }, [hasNextPage, hideFooter]);

  const selectCategory = useCallback(
    (categoryId: string | null) => {
      setSearchParams(categoryId ? { [CATEGORY_PARAM]: categoryId } : {}, {
        replace: true,
        preventScrollReset: true,
      });
    },
    [setSearchParams]
  );

  const scrollToModels = () => {
    document.getElementById("models")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const models = data?.pages.flatMap((page) => page.models) ?? [];

  const renderModels = () => {
    if (isError) {
      return (
        <div className="flex flex-col items-center rounded-xl border border-br-subtle bg-surface-card px-6 py-12 text-center">
          <p className="text-base font-semibold text-txt-primary">We couldn&apos;t load models</p>
          <p className="mt-1 text-sm text-txt-secondary">
            Check your connection and try again.
          </p>
          <Button
            className="mt-5"
            variant="secondary"
            onClick={() => void refetch()}
            leftIcon={<RefreshCw className="size-4" aria-hidden="true" />}
          >
            Try again
          </Button>
        </div>
      );
    }

    if (isLoading && !models.length) {
      return <HomeModelsGridSkeleton />;
    }

    if (!models.length) {
      return (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-br-secondary px-6 py-12 text-center">
          <p className="text-base font-semibold text-txt-primary">
            {category ? `No models in ${category.name} yet` : "No models yet"}
          </p>
          <p className="mt-1 text-sm text-txt-secondary">Be the first to share one.</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            {category && (
              <Button variant="secondary" onClick={() => selectCategory(null)}>
                Show all models
              </Button>
            )}
            <Link
              to="/model/upload"
              className="inline-flex h-10 items-center rounded-md px-4 text-sm font-semibold text-accent-text hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            >
              Upload a model
            </Link>
          </div>
        </div>
      );
    }

    return (
      <InfiniteScrollList
        items={models}
        hasMore={hasNextPage}
        loadMore={fetchNextPage}
        isLoading={isFetchingNextPage}
        loader={
          <div className="flex justify-center py-10">
            <Spinner size={24} />
          </div>
        }
      >
        <HomeModelsGrid models={models} />
      </InfiniteScrollList>
    );
  };

  return (
    <div className="bg-page text-txt-primary">
      <HomeHero onBrowse={scrollToModels} />

      <section
        id="models"
        aria-labelledby="models-heading"
        className="mx-auto max-w-[1600px] scroll-mt-20 px-4 pb-16 pt-8 sm:px-6 md:pt-10 lg:px-8"
      >
        <h2 id="models-heading" className="mb-4 text-xl font-semibold text-txt-primary md:text-2xl">
          {category ? category.name : "Latest models"}
        </h2>

        <CategoryChips selectedId={category?.id ?? null} onSelect={selectCategory} />

        <div className="mt-6">{renderModels()}</div>
      </section>
    </div>
  );
};
