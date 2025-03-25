import { useEffect, useState } from "react";
import { getFirestore, collection, query, where, getDocs, getDoc, doc } from "firebase/firestore";
import { useAuth } from "../../../contexts/authContext";

const db = getFirestore();

export const LikesSection = () => {
    const { currentUser } = useAuth();
    const [likedArtworks, setLikedArtworks] = useState([]);

    useEffect(() => {
        const fetchLikedArtworks = async () => {
            if (!currentUser) return; // Ensure user is logged in

            // Query to fetch all likes by current user
            const q = query(
                collection(db, "likes"),
                where("userId", "==", currentUser.uid) // Get likes by the logged-in user
            );

            const querySnapshot = await getDocs(q);
            const likedArtIds = querySnapshot.docs.map(doc => doc.data().artId);

            // Now, fetch the corresponding artworks by their IDs
            const artworks = await Promise.all(likedArtIds.map(async (artId) => {
                const artDoc = await getDoc(doc(db, "uploads", artId));
                return artDoc.data();
            }));

            setLikedArtworks(artworks);
        };

        fetchLikedArtworks();
    }, [currentUser]);

    return (
        <div className="container mx-auto px-4 pb-8 text-txt-primary">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {likedArtworks.length === 0 ? (
                    <p className="text-txt-secondary">No liked models yet.</p>
                ) : (
                    likedArtworks.map((art, index) => (
                        <article
                            key={index}
                            className="relative bg-bg-surface border border-br-primary rounded-md overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                        >
                            <img
                                src={art.imageUrl}
                                alt={art.title}
                                className="w-full h-auto object-cover"
                            />
                            <div className="p-3">
                                <h2 className="text-lg font-semibold mb-1 text-txt-primary">
                                    {art.title}
                                </h2>
                                <p className="text-txt-secondary text-sm mb-2">
                                    By {art.artist}
                                </p>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-txt-secondary">
                                        <i className="fas fa-heart text-error mr-1"></i>
                                        {art.likes}
                                    </span>
                                    <span className="text-txt-secondary">
                                        <i className="fas fa-eye text-txt-highlight mr-1"></i>
                                        {art.views}
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

