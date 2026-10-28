import { Link } from "react-router-dom";
import { Box, Upload } from "lucide-react";

import { buttonClassName } from "@/components";
import {
  HomeModelsGrid,
  HomeModelsGridSkeleton,
} from "@/features/home/components/HomeModelsGrid";
import { useFetchUserModels } from "@/features/models/hooks/useFetchUserModels";
import { InfiniteScrollList } from "@/features/shared/InfiniteScrollList";
import { Spinner } from "@/features/shared/reusable/Spinner";

interface ProfileModelsProps {
  userId: string;
  displayName: string;
  isOwner: boolean;
}

/** Everyone sees a creator's models in the gallery grid. */
export const ProfileModels = ({ userId, displayName, isOwner }: ProfileModelsProps) => {
  const { models, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useFetchUserModels(userId);

  if (isLoading) {
    return <HomeModelsGridSkeleton count={7} />;
  }

  if (error) {
    return (
      <p className="m-4 rounded-lg border border-error/40 bg-error/10 p-4 text-sm text-txt-primary">
        We couldn&apos;t load these models. Refresh to try again.
      </p>
    );
  }

  if (!models.length) {
    return (
      <div className="bg-buildplate m-3 flex flex-col items-center rounded-xl border border-dashed border-br-secondary px-6 py-16 text-center sm:m-5">
        <span className="chamfer flex size-14 items-center justify-center bg-muted text-txt-muted [--cut:10px]">
          <Box className="size-7" aria-hidden="true" />
        </span>
        <p className="mt-4 text-base font-semibold text-txt-primary">
          {isOwner ? "Your shelf is empty" : `${displayName} hasn't shared models yet`}
        </p>
        {isOwner && (
          <>
            <p className="mt-1 text-sm text-txt-secondary">Upload your first model to fill it.</p>
            <Link to="/model/upload" className={buttonClassName({ className: "mt-5" })}>
              <Upload className="size-4" aria-hidden="true" />
              Upload a model
            </Link>
          </>
        )}
      </div>
    );
  }

  return (
    <InfiniteScrollList
      items={models}
      hasMore={hasNextPage ?? false}
      loadMore={fetchNextPage}
      loader={
        <div className="flex justify-center py-10">
          <Spinner size={24} />
        </div>
      }
      isLoading={isFetchingNextPage}
    >
      <HomeModelsGrid models={models} />
    </InfiniteScrollList>
  );
};
