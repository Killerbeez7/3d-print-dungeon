import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
    getFirestore,
    collection,
    getDocs,
    query as firestoreQuery,
    orderBy,
    where,
    limit,
} from "firebase/firestore";
import { useModels } from "../../../contexts/modelsContext";

/**
 * Example: /search?category=artists&query=someName
 *          /search?category=artworks&query=castle
 *          /search?category=all&query=castle
 *          /search?category=artists      (no query)
 *          /search?category=all          (no query => default?)
 */
export const SearchDynamic = () => {
    const [searchParams] = useSearchParams();
    const category = searchParams.get("category") || "all";
    const q = searchParams.get("query") || "";

    const db = getFirestore();
    const { models, loading: modelsLoading } = useModels();

    const [artistResults, setArtistResults] = useState([]);
    const [modelResults, setModelResults] = useState([]);

    const [loading, setLoading] = useState(false);

    // On mount or whenever category/query changes
    useEffect(() => {
        let canceled = false;

        async function doSearch() {
            setLoading(true);

            /* ARTIST RESULTS */
            let newArtistResults = [];
            if (category === "artists" || category === "all") {
                // If user wants "all artists" (q is empty or 'all')
                if (!q.trim() || q.trim().toLowerCase() === "all") {
                    // fetch all artists
                    newArtistResults = await fetchAllArtists();
                } else {
                    // fetch all artists and filter them by substring
                    const all = await fetchAllArtists();
                    newArtistResults = all.filter((a) =>
                        a.displayName?.toLowerCase().includes(q.toLowerCase())
                    );
                }
            }

            /* MODEL / ARTWORK RESULTS */
            let newModelResults = [];
            if (category === "artworks" || category === "all") {
                if (!q.trim() || q.trim().toLowerCase() === "all") {
                    // if user wants "all" or empty => return all models
                    newModelResults = models;
                } else {
                    // else filter by substring
                    newModelResults = models.filter((m) =>
                        m.name.toLowerCase().includes(q.toLowerCase())
                    );
                }
            }

            if (!canceled) {
                setArtistResults(newArtistResults);
                setModelResults(newModelResults);
                setLoading(false);
            }
        }

        // If no category recognized or it is one you don’t handle, do something default
        doSearch();

        return () => {
            canceled = true;
        };
    }, [q, category, models]);

    const isLoading = loading || modelsLoading;

    return (
        <div className="min-h-screen bg-bg-primary text-txt-primary p-6">
            <h1 className="text-2xl font-bold mb-4">
                Search results for: <span className="text-accent">{q || "(none)"}</span>{" "}
                <small className="text-sm text-txt-secondary ml-2">
                    (Category: {category})
                </small>
            </h1>

            {isLoading && <p className="mb-4 text-sm text-txt-secondary">Loading...</p>}

            {/* Artists Section */}
            {(category === "artists" || category === "all") && (
                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-3">Artists</h2>
                    {artistResults.length === 0 && !isLoading && (
                        <p className="text-sm text-txt-secondary">No artists found.</p>
                    )}
                    <div className="flex flex-wrap gap-4">
                        {artistResults.map((a) => (
                            <Link
                                key={a.uid}
                                to={`/artist/${a.uid}`}
                                className="border border-br-primary p-2 rounded hover:shadow-md flex items-center gap-2"
                            >
                                <img
                                    src={a.photoURL || "/default-avatar.png"}
                                    alt={a.displayName || "Unknown Artist"}
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                                <span>{a.displayName}</span>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Models/Artworks Section */}
            {(category === "artworks" || category === "all") && (
                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-3">Artworks</h2>
                    {modelResults.length === 0 && !isLoading && (
                        <p className="text-sm text-txt-secondary">No models found.</p>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {modelResults.map((m) => (
                            <Link
                                key={m.id}
                                to={`/model/${m.id}`}
                                className="border border-br-primary rounded-md overflow-hidden hover:shadow-md transition-shadow"
                            >
                                <img
                                    src={m.primaryRenderUrl || "/placeholder.jpg"}
                                    alt={m.name}
                                    className="w-full h-40 object-cover"
                                    loading="lazy"
                                />
                                <div className="p-2">
                                    <h3 className="font-medium">{m.name}</h3>
                                    <p className="text-xs text-txt-secondary">
                                        {m.description?.slice(0, 60)}...
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};

/** Example: fetch all artists. You can use a condition if
 * only those with `artist: true`, or if you want literally all users.
 */
async function fetchAllArtists() {
    const db = getFirestore();
    const colRef = collection(db, "users");
    // If only those flagged as artists:
    // const q = firestoreQuery(colRef, where("artist", "==", true));
    // else get all:
    const q = firestoreQuery(colRef, orderBy("displayName"), limit(100));
    const snap = await getDocs(q);
    return snap.docs.map((doc) => ({ uid: doc.id, ...doc.data() }));
}
