// src/components/search/search-dynamic/SearchDynamic.jsx

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

// Example advanced filter options
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

    // 1) Read the URL param "?query=..."
    const [searchParams] = useSearchParams();
    const urlQuery = searchParams.get("query") || "";

    // 2) Local state for the typed input, defaulting to the param
    const [searchTerm, setSearchTerm] = useState(urlQuery);

    // If the URL changes while on this page, update local searchTerm
    useEffect(() => {
        setSearchTerm(urlQuery);
    }, [urlQuery]);

    // 3) Tabs: "artworks" (default) or "artists"
    const [activeTab, setActiveTab] = useState("artworks");

    // 4) Advanced filter states (applies to Artworks only)
    const [sortBy, setSortBy] = useState("relevance");
    const [selectedMedia, setSelectedMedia] = useState([]); // multi-select
    const [selectedSubjects, setSelectedSubjects] = useState([]); // multi-select
    const [hideAI, setHideAI] = useState(false);

    // 5) Result arrays
    const [modelResults, setModelResults] = useState([]);
    const [artistResults, setArtistResults] = useState([]);
    const [loading, setLoading] = useState(false);

    // 6) Debounced effect: if user types in searchTerm, do real-time search
    useEffect(() => {
        let canceled = false;
        setLoading(true);

        // If user typed nothing => show no results
        if (!searchTerm.trim()) {
            setModelResults([]);
            setArtistResults([]);
            setLoading(false);
            return;
        }

        const timer = setTimeout(async () => {
            try {
                if (activeTab === "artworks") {
                    // Filter local "models" by name
                    let matched = models.filter((m) =>
                        m.name.toLowerCase().includes(searchTerm.toLowerCase())
                    );
                    // Then apply advanced filters (sort, medium, subject, hideAI)
                    matched = applyAdvancedFilters(matched);

                    if (!canceled) {
                        setModelResults(matched);
                        setArtistResults([]);
                        setLoading(false);
                    }
                } else {
                    // activeTab === "artists"
                    // Fetch from Firestore, order by displayName
                    const colRef = collection(db, "users");
                    const snap = await getDocs(
                        firestoreQuery(colRef, orderBy("displayName"))
                    );
                    const allArtists = snap.docs.map((doc) => ({
                        uid: doc.id,
                        ...doc.data(),
                    }));

                    // Filter them locally
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
                    // fallback => empty results
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

    // 7) If user toggles advanced filters, re-filter current modelResults
    useEffect(() => {
        if (activeTab === "artworks" && searchTerm.trim()) {
            setModelResults((prev) => applyAdvancedFilters(prev));
        }
    }, [sortBy, selectedMedia, selectedSubjects, hideAI]);

    // 8) Advanced filter function
    function applyAdvancedFilters(list) {
        let filtered = [...list];

        // Medium filter
        if (selectedMedia.length > 0) {
            filtered = filtered.filter((m) => selectedMedia.includes(m.medium));
        }

        // Subject filter
        if (selectedSubjects.length > 0) {
            filtered = filtered.filter((m) => {
                if (Array.isArray(m.subjects)) {
                    return m.subjects.some((sub) => selectedSubjects.includes(sub));
                }
                return selectedSubjects.includes(m.subject);
            });
        }

        // Hide AI
        if (hideAI) {
            filtered = filtered.filter((m) => !m.isAI);
        }

        // Sort
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
                // "relevance" => do nothing
                break;
        }

        return filtered;
    }

    // Helper to toggle an item in an array (for multi-select)
    function toggleArrayValue(arr, value) {
        if (arr.includes(value)) {
            return arr.filter((v) => v !== value);
        }
        return [...arr, value];
    }

    const isLoading = loading || modelsLoading;

    return (
        <div className="min-h-screen bg-bg-primary text-txt-primary p-6">
            {/* Search input at top (real-time) */}
            <div className="max-w-xl mx-auto mb-4">
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="
            w-full border border-br-primary rounded px-4 py-2
            focus:outline-none focus:border-accent
          "
                />
            </div>

            {/* Tab buttons (Artworks / Artists) */}
            <div className="max-w-xl mx-auto flex space-x-4 mb-6">
                <button
                    onClick={() => setActiveTab("artworks")}
                    className={`
            px-4 py-2 rounded font-medium transition-colors
            ${
                activeTab === "artworks"
                    ? "bg-accent text-white"
                    : "bg-bg-surface text-txt-secondary hover:bg-accent-hover"
            }
          `}
                >
                    Artworks
                </button>
                <button
                    onClick={() => setActiveTab("artists")}
                    className={`
            px-4 py-2 rounded font-medium transition-colors
            ${
                activeTab === "artists"
                    ? "bg-accent text-white"
                    : "bg-bg-surface text-txt-secondary hover:bg-accent-hover"
            }
          `}
                >
                    Artists
                </button>
            </div>

            {/* Criteria Fields (only if on "artworks") */}
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
                                className="
                  w-full border border-br-primary rounded px-2 py-1
                  focus:outline-none focus:border-accent
                "
                            >
                                {sortOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Medium (multi-check) */}
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

                        {/* Subject (multi-check) */}
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

            {/* Loading or Results */}
            {isLoading ? (
                <p className="text-sm text-txt-secondary mb-4">Loading...</p>
            ) : (
                <>
                    {activeTab === "artworks" ? (
                        <section className="max-w-6xl mx-auto">
                            <h2 className="text-xl font-semibold mb-3">Artworks</h2>
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
                    ) : (
                        <section className="max-w-6xl mx-auto">
                            <h2 className="text-xl font-semibold mb-3">Artists</h2>
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
                                        className="
                      border border-br-primary p-2 rounded
                      hover:shadow-md transition-shadow
                      flex items-center gap-2
                    "
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
                </>
            )}
        </div>
    );
}
