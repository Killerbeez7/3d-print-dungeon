import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
    getFirestore,
    collection,
    getDocs,
    query as firestoreQuery,
    orderBy,
} from "firebase/firestore";
import { useModels } from "../../../contexts/modelsContext";

const sortOptions = [
    { value: "relevance", label: "Relevance" },
    { value: "likes", label: "Most Liked" },
    { value: "latest", label: "Newest" },
];

const mediumOptions = [
    { value: "digital2d", label: "Digital 2D" },
    { value: "digital3d", label: "Digital 3D" },
    { value: "animation", label: "Animation" },
];

const subjectOptions = [
    { value: "abstract", label: "Abstract" },
    { value: "anatomy", label: "Anatomy" },
    { value: "animals", label: "Animals & Wildlife" },
    { value: "props", label: "Props" },
];

export function SearchDynamic() {
    const db = getFirestore();
    const { models, loading: modelsLoading } = useModels();

    // 1) Read the "?query=..." param from the URL
    const [searchParams] = useSearchParams();
    const urlQuery = searchParams.get("query") || "";

    // 2) Local state for the typed search
    const [searchTerm, setSearchTerm] = useState(urlQuery);

    // If the URL param changes, update local searchTerm
    useEffect(() => {
        setSearchTerm(urlQuery);
    }, [urlQuery]);

    // 3) Tabs for "artworks" or "artists"
    const [activeTab, setActiveTab] = useState("artworks");

    // 4) Advanced filters (applies only to artworks)
    const [sortBy, setSortBy] = useState("relevance");
    const [selectedMedia, setSelectedMedia] = useState([]);
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [hideAI, setHideAI] = useState(false);

    // 5) Results
    const [modelResults, setModelResults] = useState([]);
    const [artistResults, setArtistResults] = useState([]);
    const [loading, setLoading] = useState(false);

    // Helper to see if user has applied any filters
    function filtersApplied() {
        // e.g. if user changed sort, selected mediums/subjects, or toggled hideAI
        if (sortBy !== "relevance") return true;
        if (selectedMedia.length > 0) return true;
        if (selectedSubjects.length > 0) return true;
        if (hideAI) return true;
        return false;
    }

    // 6) Debounced effect for real-time searching
    useEffect(() => {
        let canceled = false;
        setLoading(true);

        // If user typed nothing => no results
        if (!searchTerm.trim()) {
            setModelResults([]);
            setArtistResults([]);
            setLoading(false);
            return;
        }

        const timer = setTimeout(async () => {
            try {
                if (activeTab === "artworks") {
                    // Filter local models by name
                    let matched = models.filter((m) =>
                        m.name.toLowerCase().includes(searchTerm.toLowerCase())
                    );
                    matched = applyAdvancedFilters(matched);
                    if (!canceled) {
                        setModelResults(matched);
                        setArtistResults([]);
                        setLoading(false);
                    }
                } else {
                    // activeTab === "artists"
                    const colRef = collection(db, "users");
                    const snap = await getDocs(
                        firestoreQuery(colRef, orderBy("displayName"))
                    );
                    const allArtists = snap.docs.map((doc) => ({
                        uid: doc.id,
                        ...doc.data(),
                    }));
                    const matchedArtists = allArtists.filter((a) =>
                        a.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
                    );
                    if (!canceled) {
                        setArtistResults(matchedArtists);
                        setModelResults([]);
                        setLoading(false);
                    }
                }
            } catch (err) {
                console.error("Error searching:", err);
                if (!canceled) {
                    setLoading(false);
                    setModelResults([]);
                    setArtistResults([]);
                }
            }
        }, 300);

        return () => {
            canceled = true;
            clearTimeout(timer);
        };
    }, [
        searchTerm,
        activeTab,
        sortBy,
        selectedMedia,
        selectedSubjects,
        hideAI,
        models,
        db,
    ]);

    // 7) Re-filter if advanced filters change
    useEffect(() => {
        if (activeTab === "artworks" && searchTerm.trim()) {
            setModelResults((prev) => applyAdvancedFilters(prev));
        }
    }, [sortBy, selectedMedia, selectedSubjects, hideAI]);

    function applyAdvancedFilters(list) {
        let filtered = [...list];
        if (selectedMedia.length > 0) {
            filtered = filtered.filter((m) => selectedMedia.includes(m.medium));
        }
        if (selectedSubjects.length > 0) {
            filtered = filtered.filter((m) => {
                if (Array.isArray(m.subjects)) {
                    return m.subjects.some((sub) => selectedSubjects.includes(sub));
                }
                return selectedSubjects.includes(m.subject);
            });
        }
        if (hideAI) {
            filtered = filtered.filter((m) => !m.isAI);
        }
        switch (sortBy) {
            case "likes":
                filtered.sort((a, b) => (b.likes || 0) - (a.likes || 0));
                break;
            case "latest":
                filtered.sort(
                    (a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0)
                );
                break;
            default:
                // relevance => do nothing
                break;
        }
        return filtered;
    }

    function toggleArrayValue(arr, value) {
        if (arr.includes(value)) {
            return arr.filter((v) => v !== value);
        }
        return [...arr, value];
    }

    const isLoading = loading || modelsLoading;

    // 8) If no search term AND no filters are applied => show the "magnifying glass" message
    const noSearchNoFilters = !searchTerm.trim() && !filtersApplied();

    return (
        <div className="min-h-screen bg-bg-primary text-txt-primary p-6">
            {/* Search input with icons */}
            <div className="max-w-xl mx-auto mb-4 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <FontAwesomeIcon icon={faSearch} />
                </span>
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full border border-br-primary rounded-full px-4 py-2 pl-10 pr-10 focus:outline-none focus:border-accent"
                />
                {searchTerm && (
                    <button
                        type="button"
                        onClick={() => setSearchTerm("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                )}
            </div>

            {/* Tab buttons */}
            <div className="max-w-xl mx-auto flex space-x-4 mb-6">
                <button
                    onClick={() => setActiveTab("artworks")}
                    className={`px-4 py-2 rounded font-medium transition-colors ${
                        activeTab === "artworks"
                            ? "bg-accent text-white"
                            : "bg-bg-surface text-txt-secondary hover:bg-accent-hover"
                    }`}
                >
                    Artworks
                </button>
                <button
                    onClick={() => setActiveTab("artists")}
                    className={`px-4 py-2 rounded font-medium transition-colors ${
                        activeTab === "artists"
                            ? "bg-accent text-white"
                            : "bg-bg-surface text-txt-secondary hover:bg-accent-hover"
                    }`}
                >
                    Artists
                </button>
            </div>

            {/* If on Artworks tab => advanced filters */}
            {activeTab === "artworks" && (
                <div className="max-w-6xl mx-auto mb-6 p-4 bg-bg-surface rounded shadow border border-br-primary">
                    <h3 className="text-xl font-semibold mb-3">Refine Your Search</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {/* Sort Field */}
                        <div>
                            <label className="block mb-1 text-sm font-medium text-txt-secondary">
                                Sort By
                            </label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full border border-br-primary rounded px-2 py-1 focus:outline-none focus:border-accent"
                            >
                                {sortOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {/* Medium multi-check */}
                        <div>
                            <label className="block mb-1 text-sm font-medium text-txt-secondary">
                                Medium
                            </label>
                            <div className="bg-bg-primary border border-br-primary rounded p-2 flex flex-wrap gap-2">
                                {mediumOptions.map((opt) => (
                                    <label
                                        key={opt.value}
                                        className="flex items-center space-x-1 text-sm"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedMedia.includes(opt.value)}
                                            onChange={() =>
                                                setSelectedMedia((prev) =>
                                                    toggleArrayValue(prev, opt.value)
                                                )
                                            }
                                        />
                                        <span>{opt.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        {/* Subject multi-check */}
                        <div>
                            <label className="block mb-1 text-sm font-medium text-txt-secondary">
                                Subject Matter
                            </label>
                            <div className="bg-bg-primary border border-br-primary rounded p-2 flex flex-wrap gap-2">
                                {subjectOptions.map((opt) => (
                                    <label
                                        key={opt.value}
                                        className="flex items-center space-x-1 text-sm"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedSubjects.includes(opt.value)}
                                            onChange={() =>
                                                setSelectedSubjects((prev) =>
                                                    toggleArrayValue(prev, opt.value)
                                                )
                                            }
                                        />
                                        <span>{opt.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        {/* Hide AI */}
                        <div>
                            <label className="block mb-1 text-sm font-medium text-txt-secondary">
                                Quick Options
                            </label>
                            <label className="bg-bg-primary border border-br-primary rounded px-3 py-2 inline-flex items-center space-x-2 text-sm cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={hideAI}
                                    onChange={() => setHideAI((prev) => !prev)}
                                />
                                <span>Hide AI-based</span>
                            </label>
                        </div>
                    </div>
                </div>
            )}

            {/* Loading state */}
            {isLoading ? (
                <p className="text-sm text-txt-secondary mb-4">Loading...</p>
            ) : (
                <>
                    {/* If user hasn't typed anything and hasn't changed any filters => show the magnifying glass message */}
                    {noSearchNoFilters ? (
                        <div className="flex flex-col items-center justify-center text-center py-20">
                            <FontAwesomeIcon
                                icon={faSearch}
                                className="text-6xl text-gray-300 mb-4"
                            />
                            <h2 className="text-xl font-semibold text-txt-secondary mb-2">
                                What would you like to search for?
                            </h2>
                            <p className="text-sm text-txt-secondary max-w-sm">
                                Start your search with a keyword or add filtering options.
                            </p>
                        </div>
                    ) : (
                        <>
                            {activeTab === "artworks" ? (
                                <section className="max-w-6xl mx-auto">
                                    <h2 className="text-xl font-semibold mb-3">
                                        Artworks
                                    </h2>
                                    {modelResults.length === 0 && (
                                        <p className="text-sm text-txt-secondary">
                                            No artworks found.
                                        </p>
                                    )}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {modelResults.map((m) => (
                                            <Link
                                                key={m.id}
                                                to={`/model/${m.id}`}
                                                className="border border-br-primary rounded-md overflow-hidden hover:shadow-md transition-shadow"
                                            >
                                                <img
                                                    src={
                                                        m.primaryRenderUrl ||
                                                        "/placeholder.jpg"
                                                    }
                                                    alt={m.name}
                                                    className="w-full h-40 object-cover"
                                                    loading="lazy"
                                                />
                                                <div className="p-2">
                                                    <h3 className="font-medium">
                                                        {m.name}
                                                    </h3>
                                                    <p className="text-xs text-txt-secondary">
                                                        {m.description?.slice(0, 60)}...
                                                    </p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </section>
                            ) : (
                                <section className="max-w-6xl mx-auto">
                                    <h2 className="text-xl font-semibold mb-3">
                                        Artists
                                    </h2>
                                    {artistResults.length === 0 && (
                                        <p className="text-sm text-txt-secondary">
                                            No artists found.
                                        </p>
                                    )}
                                    <div className="flex flex-wrap gap-4">
                                        {artistResults.map((a) => (
                                            <Link
                                                key={a.uid}
                                                to={`/artist/${a.uid}`}
                                                className="border border-br-primary p-2 rounded hover:shadow-md transition-shadow flex items-center gap-2"
                                            >
                                                <img
                                                    src={
                                                        a.photoURL ||
                                                        "/default-avatar.png"
                                                    }
                                                    alt={
                                                        a.displayName || "Unknown Artist"
                                                    }
                                                    className="w-12 h-12 rounded-full object-cover"
                                                />
                                                <span>{a.displayName}</span>
                                            </Link>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </>
                    )}
                </>
            )}
        </div>
    );
}
