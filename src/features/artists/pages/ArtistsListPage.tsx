import { useQuery } from "@tanstack/react-query";
import { fetchArtists } from "../services/artistsService";
import { ArtistListGrid } from "../components/ArtistListGrid";
import { ArtistListSkeleton } from "../components/ArtistListSkeleton";
import type { ArtistData } from "../types/artists";

export const ArtistsListPage = () => {
    const {
        data: artists = [],
        isLoading,
        isError,
        error,
    } = useQuery<ArtistData[], Error>({
        queryKey: ["artists"],
        queryFn: fetchArtists,
    });

    if (isLoading) {
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

    // Prepare data for ArtistListGrid (no getArtistPath in the object)
    const artistCardData = artists.map((artist) => ({
        id: artist.id,
        displayName: artist.displayName,
        photoURL: artist.photoURL,
        bio: artist.bio,
    }));

    return (
        <section className="text-txt-primary min-h-screen">
            <div className="p-4">
                <h1 className="font-bold mb-4">Artists</h1>
                <article>
                    <ArtistListGrid
                        artists={artistCardData}
                        getArtistPath={(id) => `/artists/${id}`}
                    />
                </article>
            </div>
        </section>
    );
};
