import { RefreshCw, TriangleAlert } from "lucide-react";

import { Button } from "@/components";
import { InfiniteScrollList } from "@/features/shared/InfiniteScrollList";
import { PageHeader } from "@/features/shared/components/PageHeader";
import { StatePanel } from "@/features/shared/components/StatePanel";
import { Spinner } from "@/features/shared/reusable/Spinner";
import { ArtistListGrid } from "../components/ArtistListGrid";
import { ArtistListSkeleton } from "../components/ArtistListSkeleton";
import { useFetchArtists } from "../hooks/useFetchArtists";
import type { ArtistData } from "../types/artists";

export const ArtistsListPage = () => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } =
    useFetchArtists({});

  const artists: ArtistData[] = (data?.pages ?? []).flatMap((page) => page.artists);

  return (
    <div className="min-h-screen bg-page pb-16">
      <PageHeader
        eyebrow="Community"
        title="Artists"
        description="The creators sharing models on 3D Print Dungeon. Open a profile to see their work."
        aside={
          artists.length > 0 && (
            <p className="font-mono text-sm text-txt-muted">
              <span className="text-2xl font-semibold text-txt-primary">{artists.length}</span>{" "}
              {artists.length === 1 ? "artist" : "artists"}
            </p>
          )
        }
      />

      <div className="mx-auto max-w-[1600px] px-4 pt-6 sm:px-6 lg:px-8">
        {isLoading ? (
          <ArtistListSkeleton />
        ) : isError ? (
          <StatePanel
            icon={TriangleAlert}
            title="Couldn't load artists"
            headingLevel="h2"
            className="min-h-[40vh]"
            actions={
              <Button
                onClick={() => window.location.reload()}
                leftIcon={<RefreshCw className="size-4" aria-hidden="true" />}
              >
                Try again
              </Button>
            }
          >
            Check your connection and try again.
          </StatePanel>
        ) : (
          <InfiniteScrollList
            items={artists}
            hasMore={Boolean(hasNextPage)}
            loadMore={fetchNextPage}
            isLoading={isFetchingNextPage}
            loader={
              <div className="flex justify-center py-10">
                <Spinner size={24} />
              </div>
            }
          >
            <ArtistListGrid artists={artists} />
          </InfiniteScrollList>
        )}
      </div>
    </div>
  );
};
