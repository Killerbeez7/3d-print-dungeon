import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../config/firebase";

export const ArtistsList = () => {
    const [artists, setArtists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const location = useLocation();

    // Determine if we're in the explore section
    const isExplore = location.pathname.startsWith('/explore');
    const getArtistPath = (artistId) => {
        return isExplore ? `/explore/artists/${artistId}` : `/artist/${artistId}`;
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
                
                const artistsList = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                
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

    return (
        <div className="text-txt-primary min-h-screen">
            <div className="mx-auto p-4">
                <h1 className="mb-4 font-bold">Artists</h1>
            </div>
            <div className="container mx-auto px-4 py-4">
                {artists.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-lg text-txt-secondary">No artists found.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {artists.map((artist) => (
                            <Link 
                                key={artist.id} 
                                to={getArtistPath(artist.id)}
                                className="block transform hover:scale-[1.02] transition-transform duration-200"
                            >
                                <article className="relative bg-bg-surface border border-br-primary rounded-md overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                    <img
                                        src={artist.photoURL || "/user.png"}
                                        alt={artist.displayName}
                                        className="w-full h-48 object-cover"
                                    />
                                    <div className="p-3">
                                        <h2 className="text-lg font-semibold mb-1">
                                            {artist.displayName || "Anonymous"}
                                        </h2>
                                        <p className="text-txt-secondary text-sm mb-2 line-clamp-2">
                                            {artist.bio || "No bio available"}
                                        </p>
                                    </div>
                                </article>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
