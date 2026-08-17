import { useFetchArtists } from "../hooks/useFetchArtists";
import { ArtistListGrid } from "../components/ArtistListGrid";
import { ArtistListSkeleton } from "../components/ArtistListSkeleton";
import { InfiniteScrollList } from "@/features/shared/InfiniteScrollList";
import { Spinner } from "@/features/shared/reusable/Spinner";
import { Button } from "@/components";
import type { ArtistData } from "../types/artists";

export const ArtistsListPage = () => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useFetchArtists({});

  const pages = data?.pages ?? [];
  const artists: ArtistData[] = pages.flatMap((p) => p.artists);

  if (isLoading && artists.length === 0) {
    return (
      <section className="text-txt-primary min-h-screen bg-page">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-txt-primary mb-4">Discover Artists</h1>
            <p className="text-lg text-txt-secondary max-w-2xl mx-auto">
              Explore talented 3D artists and their amazing creations
            </p>
          </div>
          <ArtistListSkeleton />
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-page px-4">
        <div className="bg-section rounded-2xl p-8 shadow-md text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 bg-error/10 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-error"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 15c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-txt-primary mb-2">
            Oops! Something went wrong
          </h2>
          <p className="text-txt-secondary mb-6">
            {error?.message || "Failed to load artists. Please try again."}
          </p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  const loader = (
    <div className="col-span-full flex justify-center py-12">
      <div className="flex flex-col items-center gap-3">
        <Spinner size={32} />
        <p className="text-txt-secondary text-sm">Loading more artists...</p>
      </div>
    </div>
  );

  return (
    <section className="text-txt-primary min-h-screen bg-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-txt-primary mb-4">Discover Artists</h1>
          <p className="text-lg text-txt-secondary max-w-2xl mx-auto">
            Explore talented 3D artists and their amazing creations in our community
          </p>

          {/* Stats */}
          {artists.length > 0 && (
            <div className="mt-6 inline-flex items-center gap-2 bg-section rounded-full px-4 py-2 shadow-sm">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
              <span className="text-sm text-txt-secondary">
                {artists.length} {artists.length === 1 ? "artist" : "artists"} discovered
              </span>
            </div>
          )}
        </div>

        {/* Artists Grid */}
        <article>
          <InfiniteScrollList
            items={artists}
            hasMore={Boolean(hasNextPage)}
            loadMore={fetchNextPage}
            isLoading={isFetchingNextPage}
            loader={loader}
          >
            <ArtistListGrid artists={artists} />
          </InfiniteScrollList>
        </article>
      </div>
    </section>
  );
};
