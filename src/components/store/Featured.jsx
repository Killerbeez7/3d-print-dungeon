import { useState, useEffect } from "react";
import { useModels } from "@/hooks/useModels";
import { Link } from "react-router-dom";
import { LazyImage } from "@/components/shared/lazy-image/LazyImage";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/config/firebase";

export const Featured = () => {
    const { models, loading } = useModels();
    const [featuredModels, setFeaturedModels] = useState([]);
    const [featuredCategories, setFeaturedCategories] = useState([]);

    useEffect(() => {
        const fetchFeaturedCategories = async () => {
            try {
                const settingsRef = doc(db, "settings", "global");
                const settingsDoc = await getDoc(settingsRef);
                
                if (settingsDoc.exists()) {
                    const settings = settingsDoc.data();
                    console.log("Fetched featured categories:", settings.featuredCategories);
                    setFeaturedCategories(settings.featuredCategories || []);
                }
            } catch (error) {
                console.error("Error fetching featured categories:", error);
            }
        };

        fetchFeaturedCategories();
    }, []);

    useEffect(() => {
        if (models.length > 0 && featuredCategories.length > 0) {
            console.log("All models:", models);
            console.log("Featured categories:", featuredCategories);
            
            // Filter models that belong to featured categories
            const featured = models.filter(model => {
                const isFeatured = featuredCategories.includes(model.category);
                console.log(`Model ${model.id} category: ${model.category}, isFeatured: ${isFeatured}`);
                return isFeatured;
            });
            
            console.log("Filtered featured models:", featured);
            setFeaturedModels(featured);
        }
    }, [models, featuredCategories]);

    if (loading) {
        return (
            <section className="max-w-6xl mx-auto py-12 px-4">
                <p className="text-txt-secondary">Loading featured models...</p>
            </section>
        );
    }

    return (
        <section className="max-w-6xl mx-auto py-12 px-4">
            <h1 className="text-3xl font-semibold mb-6">Featured Models</h1>
            <p className="text-lg text-txt-secondary mb-8">
                Hand-picked models selected by our team.
            </p>

            {featuredModels.length === 0 ? (
                <div>
                    <p className="text-txt-secondary">No featured models available at the moment.</p>
                    <p className="text-sm text-txt-secondary mt-2">
                        Featured categories: {featuredCategories.join(", ")}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {featuredModels.map((model) => (
                        <Link key={model.id} to={`/model/${model.id}`}>
                            <article className="relative bg-bg-surface rounded-md overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                <div className="relative w-full aspect-square">
                                    <LazyImage
                                        src={model.primaryRenderUrl || "/assets/images/default-image.png"}
                                        alt={model.name}
                                        className="absolute inset-0 w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-start opacity-0 hover:opacity-100 transition-opacity">
                                        <div className="text-white p-4">
                                            <h4 className="font-semibold text-lg">{model.name}</h4>
                                            <p className="text-sm">{model.uploaderDisplayName || "Anonymous"}</p>
                                            <div className="flex items-center gap-4 mt-2 text-sm">
                                                <span className="flex items-center">
                                                    <i className="fas fa-heart text-error mr-1"></i>
                                                    {model.likes || 0}
                                                </span>
                                                <span className="flex items-center">
                                                    <i className="fas fa-eye text-txt-highlight mr-1"></i>
                                                    {model.views || 0}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        </Link>
                    ))}
                </div>
            )}
        </section>
    );
};
