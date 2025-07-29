/**
 * @file ArtistsListPage.tsx
 * @description Displays the list page for artists
 * @usedIn ArtistsRoutes
 */

import { useFetchArtists } from "../hooks/useFetchArtists";
import { ArtistListGrid } from "../components/ArtistListGrid";
import { ArtistListSkeleton } from "../components/ArtistListSkeleton";
import { InfiniteScrollList } from "@/features/shared/InfiniteScrollList";
import { Spinner } from "@/features/shared/reusable/Spinner";
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
            <section className="text-txt-primary min-h-screen">
                <div className="p-4">
                    <h1 className="font-bold mb-4">Artists</h1>
                    <ArtistListSkeleton />
                </div>
            </section>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen">
                <p className="text-lg text-error mb-4">
                    Error: {error?.message || "Failed to load artists."}
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-accent text-white rounded hover:bg-accent-hover"
                >
                    Try Again
                </button>
            </div>
        );
    }

    const artistCardData = artists.map((artist) => ({
        uid: artist.uid,
        email: artist.email,
        displayName: artist.displayName,
        photoURL: artist.photoURL,
        bio: artist.bio,
    }));

    const loader = (
        <div className="col-span-full flex justify-center py-10">
            <Spinner size={24} />
        </div>
    );

    return (
        <section className="text-txt-primary min-h-screen">
            <div className="p-4">
                <h1 className="font-bold mb-4">Artists</h1>
                <article>
                    <InfiniteScrollList
                        items={artists}
                        hasMore={Boolean(hasNextPage)}
                        loadMore={fetchNextPage}
                        isLoading={isFetchingNextPage}
                        loader={loader}
                    >
                        <ArtistListGrid artists={artistCardData} />
                    </InfiniteScrollList>
                </article>
            </div>
        </section>
    );
};
