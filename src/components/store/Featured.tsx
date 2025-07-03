import { useState, useEffect } from "react";
import { useModels } from "@/hooks/useModels";
import { Link } from "react-router-dom";
import { LazyImage } from "@/components/shared/lazy-image/LazyImage";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/config/firebase";
import { getThumbnailUrl, THUMBNAIL_SIZES } from "@/utils/imageUtils";

interface FeaturedModel {
    id: string;
    name: string;
    category: string;
    uploaderDisplayName: string;
    renderPrimaryUrl: string;
    [key: string]: unknown;
}

export const Featured = () => {
    const { models, loading } = useModels();
    const [featuredModels, setFeaturedModels] = useState<FeaturedModel[]>([]);
    const [featuredCategories, setFeaturedCategories] = useState<string[]>([]);

    useEffect(() => {
        const fetchFeaturedCategories = async () => {
            try {
                const settingsRef = doc(db, "settings", "global");
                const settingsDoc = await getDoc(settingsRef);

                if (settingsDoc.exists()) {
                    const settings = settingsDoc.data();
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
            // Filter models that belong to featured categories
            const featured = models.filter((model: FeaturedModel) =>
                featuredCategories.includes(model.category)
            );
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
                    <p className="text-txt-secondary">
                        No featured models available at the moment.
                    </p>
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
                                        src={
                                            getThumbnailUrl(
                                                model.renderPrimaryUrl,
                                                THUMBNAIL_SIZES.MEDIUM
                                            ) || "/assets/images/default-image.png"
                                        }
                                        alt={model.name}
                                        className="absolute inset-0 w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0000006f] to-transparent flex items-end justify-start opacity-100 sm:opacity-0 sm:hover:opacity-100 transition-opacity">
                                        <div className="text-white p-2 sm:m-2">
                                            <h4 className="font-semibold text-sm sm:text-base truncate">
                                                {model.name}
                                            </h4>
                                            <p className="text-xs sm:text-sm truncate">
                                                {model.uploaderDisplayName}
                                            </p>
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
