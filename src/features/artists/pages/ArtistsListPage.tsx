import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { fetchArtists } from "../services/artistsService";
import { ArtistListGrid } from "../components/ArtistListGrid";
import { ArtistListSkeleton } from "../components/ArtistListSkeleton";
import type { Artist } from "../types/artists";

export const ArtistsListPage = () => {
    const location = useLocation();
    const { data: artists = [], isLoading, isError, error } = useQuery<Artist[], Error>({
        queryKey: ["artists"],
        queryFn: fetchArtists,
    });

    // Determine if we're in the explore section
    const isExplore = location.pathname.startsWith("/explore");
    const getArtistPath = (artistId: string) => {
        return isExplore ? `/explore/artists/${artistId}` : `/artists/${artistId}`;
    };

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
                        getArtistPath={getArtistPath}
                    />
                </article>
            </div>
        </section>
    );
};
