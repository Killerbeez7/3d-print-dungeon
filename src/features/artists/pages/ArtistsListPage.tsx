import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../config/firebaseConfig";
import type { RawUserData } from "@/features/auth/types/auth";
import { ArtistListGrid } from "../components/ArtistListGrid";

interface Artist extends RawUserData {
    id: string;
    bio?: string;
    photoURL: string | null;
    displayName: string | null;
}

export const ArtistsListPage = () => {
    const [artists, setArtists] = useState<Artist[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const location = useLocation();

    // Determine if we're in the explore section
    const isExplore = location.pathname.startsWith("/explore");
    const getArtistPath = (artistId: string) => {
        return isExplore ? `/explore/artists/${artistId}` : `/artists/${artistId}`;
    };

    useEffect(() => {
        const fetchArtists = async () => {
            try {
                setLoading(true);
                setError(null);

                // Create a query for users where artist = true
                const usersRef = collection(db, "users");
                const artistsQuery = query(usersRef, where("artist", "==", true));
                const querySnapshot = await getDocs(artistsQuery);

                const artistsList: Artist[] = querySnapshot.docs.map((doc) => {
                    const data = doc.data() as RawUserData & { bio?: string };
                    return {
                        ...data,
                        id: doc.id,
                        uid: data.uid ?? doc.id,
                        email: data.email ?? null,
                        displayName: data.displayName ?? null,
                        photoURL: data.photoURL ?? null,
                        bio: data.bio,
                    };
                });

                setArtists(artistsList);
            } catch (error) {
                console.error("Error fetching artists:", error);
                setError("Failed to load artists. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchArtists();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p className="text-lg">Loading artists...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen">
                <p className="text-lg text-error mb-4">{error}</p>
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
                    <ArtistListGrid artists={artistCardData} getArtistPath={getArtistPath} />
                </article>
            </div>
        </section>
    );
};
