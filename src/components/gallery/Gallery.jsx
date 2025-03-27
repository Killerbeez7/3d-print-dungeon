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
                m.primaryRenderLowResUrl || m.primaryRenderUrl || "/image.png";

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
            {/* Featured Section - Large clickable images */}
            <section className="px-4 py-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Link to="/news">
                        <div className="relative overflow-hidden rounded-lg shadow-lg">
                            <img
                                src="/image.png" // Replace with an actual image
                                alt="News"
                                className="w-full h-[300px] object-cover rounded-lg"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0000009e] to-transparent flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                <h3 className="text-white text-2xl font-bold">News</h3>
                            </div>
                        </div>
                    </Link>
                    <Link to="/featured">
                        <div className="relative overflow-hidden rounded-lg shadow-lg">
                            <img
                                src="/image.png"
                                alt="Prints"
                                className="w-full h-[300px] object-cover rounded-lg"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0000009e] to-transparent flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                <h3 className="text-white text-2xl font-bold">Featured Models</h3>
                            </div>
                        </div>
                    </Link>
                    <Link to="/business">
                        <div className="relative overflow-hidden rounded-lg shadow-lg">
                            <img
                                src="/image.png" // Replace with an actual image
                                alt="3D Models"
                                className="w-full h-[300px] object-cover rounded-lg"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#000000af] to-transparent flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                <h3 className="text-white text-2xl font-bold">For Business</h3>
                            </div>
                        </div>
                    </Link>
                </div>
            </section>
    
            {/* Category and Sort Filters */}
            <div className="mx-auto p-4">
                <h1 className="mb-4 font-bold">Gallery</h1>
    
                {/* Category Buttons */}
                <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-2">
                    <div className="flex items-center mb-3 md:mb-0 space-x-2">
                    <label htmlFor="sortBy" className="text-txt-secondary text-lg font-medium">
                            Filter by:
                        </label>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setCategoryFilter("all")}
                                className={`py-2 px-4 rounded-full text-sm font-medium transition-all ${categoryFilter === "all" ? "bg-accent text-white" : "bg-bg-surface hover:bg-accent-hover"}`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setCategoryFilter("2D")}
                                className={`py-2 px-4 rounded-full text-sm font-medium transition-all ${categoryFilter === "2D" ? "bg-accent text-white" : "bg-bg-surface hover:bg-accent-hover"}`}
                            >
                                2D
                            </button>
                            <button
                                onClick={() => setCategoryFilter("3D")}
                                className={`py-2 px-4 rounded-full text-sm font-medium transition-all ${categoryFilter === "3D" ? "bg-accent text-white" : "bg-bg-surface hover:bg-accent-hover"}`}
                            >
                                3D
                            </button>
                            <button
                                onClick={() => setCategoryFilter("Concept")}
                                className={`py-2 px-4 rounded-full text-sm font-medium transition-all ${categoryFilter === "Concept" ? "bg-accent text-white" : "bg-bg-surface hover:bg-accent-hover"}`}
                            >
                                Concept
                            </button>
                        </div>
                    </div>
    
                    {/* Sort Menu as Tag Buttons */}
                    <div className="flex items-center space-x-2">
                        <label htmlFor="sortBy" className="text-txt-secondary text-lg font-medium">
                            Sort by:
                        </label>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setSortBy("community")}
                                className={`py-2 px-4 rounded-full text-sm font-medium transition-all ${sortBy === "community" ? "bg-accent text-white" : "bg-bg-surface hover:bg-accent-hover"}`}
                            >
                                Community
                            </button>
                            <button
                                onClick={() => setSortBy("popular")}
                                className={`py-2 px-4 rounded-full text-sm font-medium transition-all ${sortBy === "popular" ? "bg-accent text-white" : "bg-bg-surface hover:bg-accent-hover"}`}
                            >
                                Popular
                            </button>
                            <button
                                onClick={() => setSortBy("latest")}
                                className={`py-2 px-4 rounded-full text-sm font-medium transition-all ${sortBy === "latest" ? "bg-accent text-white" : "bg-bg-surface hover:bg-accent-hover"}`}
                            >
                                Latest
                            </button>
                            <button
                                onClick={() => setSortBy("views")}
                                className={`py-2 px-4 rounded-full text-sm font-medium transition-all ${sortBy === "views" ? "bg-accent text-white" : "bg-bg-surface hover:bg-accent-hover"}`}
                            >
                                Most Viewed
                            </button>
                        </div>
                    </div>
                </div>
            </div>
    
            {/* Gallery Section */}
            <div className="mx-auto px-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2">
                    {displayedArtworks.map((art) => (
                        <Link key={art.id} to={`/model/${art.id}`}>
                            <article className="relative bg-bg-surface rounded-md overflow-hidden shadow-sm hover:shadow-md transition-shadow w-full pb-[100%]">
                                <img
                                    src={art.imageUrl}
                                    alt={art.title}
                                    className="absolute inset-0 w-full h-full object-cover rounded-lg"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0000006f] to-transparent flex items-end justify-start opacity-0 hover:opacity-100 transition-opacity">
                                    <div className="text-white m-2">
                                        <h4 className="font-semibold">{art.title}</h4>
                                        <p className="text-sm">{art.artist}</p>
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
