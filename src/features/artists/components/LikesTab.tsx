import { useEffect, useState } from "react";
import {
    getFirestore,
    collection,
    query,
    where,
    getDocs,
    getDoc,
    doc,
} from "firebase/firestore";
import { getThumbnailUrl } from "@/utils/imageUtils";

interface LikesTabProps {
    userId: string;
}

interface LikedArtwork {
    id: string;
    title: string;
    artist: string;
    imageUrl: string;
    likes: number;
    views: number;
}

const db = getFirestore();

export const LikesTab = ({ userId }: LikesTabProps) => {
    const [likedArtworks, setLikedArtworks] = useState<LikedArtwork[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLikedArtworks = async () => {
            if (!userId) {
                setLikedArtworks([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const q = query(collection(db, "likes"), where("userId", "==", userId));

                const querySnapshot = await getDocs(q);
                const likedModelIds = querySnapshot.docs
                    .map((doc) => doc.data().modelId)
                    .filter(Boolean);

                if (!likedModelIds || likedModelIds.length === 0) {
                    setLikedArtworks([]);
                    setLoading(false);
                    return;
                }

                const artworks = await Promise.all(
                    likedModelIds.map(async (modelId: string) => {
                        try {
                            const modelDoc = await getDoc(doc(db, "models", modelId));
                            if (modelDoc.exists()) {
                                const data = modelDoc.data();
                                return {
                                    id: modelDoc.id,
                                    title: data.name || "Untitled",
                                    artist: data.uploaderDisplayName || "Unknown Artist",
                                    imageUrl:
                                        getThumbnailUrl(
                                            data.renderPrimaryUrl,
                                            "MEDIUM"
                                        ) || "/default-artwork.png",
                                    likes: data.likes || 0,
                                    views: data.views || 0,
                                };
                            }
                            return null;
                        } catch (error) {
                            console.error(`Error fetching model ${modelId}:`, error);
                            return null;
                        }
                    })
                );

                setLikedArtworks(
                    artworks.filter((art): art is LikedArtwork => art !== null)
                );
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
