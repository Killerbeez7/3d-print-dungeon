import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../config/firebase";

export const UploadsSection = ({ userId }) => {
    const [artworks, setArtworks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUploads = async () => {
            if (!userId) return;
            
            try {
                setLoading(true);
                const modelsRef = collection(db, "models");
                const uploadsQuery = query(modelsRef, where("uploaderId", "==", userId));
                const querySnapshot = await getDocs(uploadsQuery);
                
                const uploads = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                
                setArtworks(uploads);
            } catch (error) {
                console.error("Error fetching uploads:", error);
                setArtworks([]);
            } finally {
                setLoading(false);
            }
        };

        fetchUploads();
    }, [userId]);

    if (loading) {
        return <div className="text-center p-4">Loading uploads...</div>;
    }

    return (
        <div className="container mx-auto pb-8 text-txt-primary">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {artworks.length === 0 ? (
                    <p className="text-txt-secondary">No uploads yet.</p>
                ) : (
                    artworks.map((art) => (
                        <article
                            key={art.id}
                            className="relative bg-bg-surface border border-br-primary rounded-md overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                        >
                            <img
                                src={art.primaryRenderUrl || "/default-image.jpg"}
                                alt={art.name || "Untitled"}
                                className="w-full h-auto object-cover"
                            />
                            <div className="p-3">
                                <h2 className="text-lg font-semibold mb-1 text-txt-primary">
                                    {art.name || "Untitled"}
                                </h2>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-txt-secondary">
                                        <i className="fas fa-heart text-error mr-1"></i>
                                        {art.likes || 0} Likes
                                    </span>
                                    <span className="text-txt-secondary">
                                        <i className="fas fa-eye text-txt-highlight mr-1"></i>
                                        {art.views || 0} Views
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

UploadsSection.propTypes = {
    userId: PropTypes.string.isRequired
};
