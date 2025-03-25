import { useState, useEffect } from "react";
import { useModels } from "../../contexts/modelsContext";
import { Link } from "react-router-dom";
import { getFirestore, doc, getDoc } from "firebase/firestore"; // Firestore functions

export const Gallery = () => {
    const { models, loading } = useModels();
    const [artworks, setArtworks] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const [sortBy, setSortBy] = useState("community");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const db = getFirestore();

    useEffect(() => {
        if (!models) return;

        const fetchUploaderData = async (model) => {
            try {
                const userDocRef = doc(db, "users", model.uploaderId);
                const userDoc = await getDoc(userDocRef);
                const uploaderData = userDoc.exists() ? userDoc.data() : null;
                return uploaderData ? uploaderData.displayName : "Anonymous";
            } catch (error) {
                console.error("Error fetching uploader data:", error);
                return "Anonymous";
            }
        };

        const transformed = models.map(async (m) => {
            const artistName = await fetchUploaderData(m);

            // Fallback logic for older docs that lack 'primaryRenderLowResUrl'
            const lowResOrPlaceholder =
                m.primaryRenderLowResUrl || m.primaryRenderUrl || "/placeholder-blur.jpg";

            return {
                id: m.id,
                title: m.name || "Untitled Model",
                artist: artistName,
                category: m.type || "3D",
                // The gallery image is the best placeholder or low-res
                imageUrl: lowResOrPlaceholder,
                likes: m.likes || 0,
                views: m.views || 0,
            };
        });

        Promise.all(transformed).then((artworksData) => {
            setArtworks(artworksData);
        });
    }, [models, db]);

    if (loading) {
        return <p className="p-4">Loading models...</p>;
    }

    const sortedArtworks = applySorting(artworks, sortBy);
    const displayedArtworks = applyCategoryFilter(sortedArtworks, categoryFilter);

    const handleLoadMore = () => {
        setHasMore(false);
    };

    return (
        <div className="bg-bg-primary text-txt-primary min-h-screen">
            <section className="relative bg-gradient-to-r from-accent to-accent-hover px-4 py-12">
                {/* Hero banner */}
            </section>
            <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex items-center mb-3 md:mb-0 space-x-2">
                    <label htmlFor="category" className="text-txt-secondary font-medium">
                        Category:
                    </label>
                    <select
                        id="category"
                        className="border border-br-primary bg-bg-surface px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-accent"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <option value="all">All</option>
                        <option value="2D">2D</option>
                        <option value="3D">3D</option>
                        <option value="Concept">Concept</option>
                    </select>
                </div>
                <div className="flex items-center space-x-2">
                    <label htmlFor="sortBy" className="text-txt-secondary font-medium">
                        Sort by:
                    </label>
                    <select
                        id="sortBy"
                        className="border border-br-primary bg-bg-surface px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-accent"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="community">Community</option>
                        <option value="popular">Popular</option>
                        <option value="latest">Latest</option>
                        <option value="views">Most Viewed</option>
                    </select>
                </div>
            </div>
            <div className="container mx-auto px-4 pb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {displayedArtworks.map((art) => (
                        <Link key={art.id} to={`/model/${art.id}`}>
                            <article className="relative bg-bg-surface border border-br-primary rounded-md overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                <picture>
                                    <source type="image/webp">
                                        <img
                                            src={art.imageUrl}
                                            alt={art.title}
                                            loading="lazy"
                                            width="400"
                                            height="200"
                                            className="w-full h-[200px] object-cover"
                                        />
                                    </source>
                                </picture>
                                <div className="p-3">
                                    <h2 className="text-lg font-semibold mb-1">
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
                        </Link>
                    ))}
                </div>
                {hasMore && (
                    <div className="text-center mt-8">
                        <button
                            onClick={handleLoadMore}
                            className="bg-accent text-white py-2 px-6 rounded-full font-medium hover:bg-accent-hover transition-colors"
                        >
                            Load More
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

function applySorting(artworks, sortBy) {
    switch (sortBy) {
        case "popular":
            return [...artworks].sort((a, b) => b.likes - a.likes);
        case "latest":
            return [...artworks];
        case "views":
            return [...artworks].sort((a, b) => b.views - a.views);
        default:
            return artworks;
    }
}

function applyCategoryFilter(artworks, category) {
    if (category === "all") return artworks;
    return artworks.filter((a) => a.category.toLowerCase() === category.toLowerCase());
}
