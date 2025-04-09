import { useEffect, useState } from "react";
import { getFirestore, collection, query, where, getDocs, getDoc, doc } from "firebase/firestore";
import PropTypes from "prop-types";

const db = getFirestore();

export const LikesSection = ({ userId }) => {
    const [likedArtworks, setLikedArtworks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLikedArtworks = async () => {
            if (!userId) return;
            setLoading(true);

            try {
                // Query to fetch all likes by the user
                const q = query(
                    collection(db, "likes"),
                    where("userId", "==", userId)
                );

                const querySnapshot = await getDocs(q);
                const likedArtIds = querySnapshot.docs.map(doc => doc.data().artId);

                // Now, fetch the corresponding artworks by their IDs
                const artworks = await Promise.all(likedArtIds.map(async (artId) => {
                    const artDoc = await getDoc(doc(db, "uploads", artId));
                    if (artDoc.exists()) {
                        return { id: artDoc.id, ...artDoc.data() };
                    }
                    return null;
                }));

                // Filter out any null values from artworks that might not exist
                setLikedArtworks(artworks.filter(art => art !== null));
            } catch (error) {
                console.error("Error fetching liked artworks:", error);
                setLikedArtworks([]);
            } finally {
                setLoading(false);
            }
        };

        fetchLikedArtworks();
    }, [userId]);

    if (loading) {
        return <div className="text-center">Loading liked artworks...</div>;
    }

    return (
        <div className="container mx-auto pb-8 text-txt-primary">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {likedArtworks.length === 0 ? (
                    <p className="text-txt-secondary">No liked models yet.</p>
                ) : (
                    likedArtworks.map((art) => (
                        <article
                            key={art.id}
                            className="relative bg-bg-surface border border-br-primary rounded-md overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                        >
                            <img
                                src={art.imageUrl || "/default-artwork.png"}
                                alt={art.title || "Artwork"}
                                className="w-full h-auto object-cover"
                            />
                            <div className="p-3">
                                <h2 className="text-lg font-semibold mb-1 text-txt-primary">
                                    {art.title || "Untitled"}
                                </h2>
                                <p className="text-txt-secondary text-sm mb-2">
                                    By {art.artist || "Unknown Artist"}
                                </p>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-txt-secondary">
                                        <i className="fas fa-heart text-error mr-1"></i>
                                        {art.likes || 0}
                                    </span>
                                    <span className="text-txt-secondary">
                                        <i className="fas fa-eye text-txt-highlight mr-1"></i>
                                        {art.views || 0}
                                    </span>
                                </div>
                            </div>
                        </article>
                    ))
                )}
            </div>
        </div>
    );
};

LikesSection.propTypes = {
    userId: PropTypes.string.isRequired
};

