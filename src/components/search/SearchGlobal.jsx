import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    getFirestore,
    collection,
    query as firestoreQuery,
    orderBy,
    limit,
    getDocs,
} from "firebase/firestore";
import { useModels } from "../../contexts/modelsContext";

export function SearchGlobal() {
    const [searchTerm, setSearchTerm] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);

    const [artistResults, setArtistResults] = useState([]);
    const [modelResults, setModelResults] = useState([]);

    const containerRef = useRef(null);
    const navigate = useNavigate();
    const db = getFirestore();
    const { models } = useModels();

    // search links
    const presetLinks = [
        { label: "Search Artworks", category: "artworks" },
        { label: "Search Artists", category: "artists" },
        { label: "Search Studios", category: "studios" },
        { label: "Search Digital Products", category: "digital" },
        { label: "Search Prints", category: "prints" },
    ];

    // Debounced fetch logic when dropdown is shown + user typed something
    useEffect(() => {
        if (!showDropdown) return;

        if (!searchTerm.trim()) {
            setArtistResults([]);
            setModelResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            try {
                // fetch top 50 artists from DB
                const colRef = collection(db, "users");
                const snap = await getDocs(
                    firestoreQuery(colRef, orderBy("displayName"), limit(50))
                );
                const allArtists = snap.docs.map((doc) => ({
                    uid: doc.id,
                    ...doc.data(),
                }));

                // local filter for artists from fetch
                const filteredArtists = allArtists.filter((a) =>
                    a.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
                );
                setArtistResults(filteredArtists.slice(0, 5));
            } catch (err) {
                console.error("Error fetching artists:", err);
                setArtistResults([]);
            }

            //  local filter for models from context
            const filteredModels = models.filter((m) =>
                m.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setModelResults(filteredModels.slice(0, 5));
        }, 300);

        return () => clearTimeout(timer);
    }, [showDropdown, searchTerm, db, models]);

    // onSubmit => go to /search
    const handleSubmit = (e) => {
        e.preventDefault();
        const queryValue = searchTerm.trim();
        navigate(`/search?category=all&query=${encodeURIComponent(queryValue)}`);
        setSearchTerm("");
        setShowDropdown(false);
        document.activeElement.blur()
    };

    // on focus show dropdown
    const handleFocus = () => {
        setShowDropdown(true);
    };

    // "See all" same logic as form submission
    const handleSeeAll = () => {
        const queryValue = searchTerm.trim();
        navigate(`/search?category=all&query=${encodeURIComponent(queryValue)}`);
        setShowDropdown(false);
    };

    const handleArtistSelect = (uid) => {
        navigate(`/artist/${uid}`);
        setShowDropdown(false);
    };

    const handleModelSelect = (id) => {
        navigate(`/model/${id}`);
        setShowDropdown(false);
    };

    const handlePresetClick = (cat) => {
        const queryValue = searchTerm.trim();
        navigate(`/search?category=${cat}&query=${encodeURIComponent(queryValue)}`);
        setShowDropdown(false);
    };

    // close dropdown if user clicks outside, while keeping the input
    useEffect(() => {
        function handleClickOutside(e) {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // clear input
    const handleClearInput = () => {
        setSearchTerm("");
        setShowDropdown(false);
        document.activeElement.blur()
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="relative w-full max-w-[800px]"
            ref={containerRef}
        >
            {/* Search icon (left) */}
            <span
                className="
          absolute left-3 top-1/2 -translate-y-1/2
          text-gray-400 pointer-events-none
        "
            >
                <FontAwesomeIcon icon={faSearch} />
            </span>

            {/* Text input with extra left & right padding for icons */}
            <input
                type="text"
                className="
          border-2 border-gray-300 rounded-full w-full
          text-sm focus:outline-none focus:border-blue-500
          py-2 pl-10 pr-10
        "
                placeholder="Search 3D models..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={handleFocus}
            />

            {/* Clear icon (right), only if there's input */}
            {searchTerm && (
                <button
                    type="button"
                    onClick={handleClearInput}
                    className="
            absolute right-3 top-1/2 -translate-y-1/2
            text-gray-400 hover:text-gray-600
          "
                >
                    <FontAwesomeIcon icon={faTimes} />
                </button>
            )}

            {showDropdown && (
                <div className="absolute top-[110%] left-0 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 z-50">
                    <ul className="py-2 max-h-80 overflow-auto text-sm">
                        {searchTerm.trim() &&
                            (artistResults.length > 0 || modelResults.length > 0) && (
                                <>
                                    {/* Artist Results */}
                                    {artistResults.map((a) => (
                                        <li
                                            key={`artist-${a.uid}`}
                                            onMouseDown={() => handleArtistSelect(a.uid)}
                                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                        >
                                            <div className="font-medium">
                                                {a.displayName}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                Artist
                                            </div>
                                        </li>
                                    ))}

                                    {/* Model Results */}
                                    {modelResults.map((m) => (
                                        <li
                                            key={`model-${m.id}`}
                                            onMouseDown={() => handleModelSelect(m.id)}
                                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                        >
                                            <div className="font-medium">{m.name}</div>
                                            <div className="text-xs text-gray-500">
                                                Model
                                            </div>
                                        </li>
                                    ))}

                                    {/* "See all" row */}
                                    <li
                                        onMouseDown={handleSeeAll}
                                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer font-medium"
                                    >
                                        See all results for <strong>{searchTerm}</strong>
                                    </li>

                                    {/* Divider */}
                                    <hr className="my-2 border-gray-200" />
                                </>
                            )}

                        {/* Preset links */}
                        {presetLinks.map((link) => (
                            <li
                                key={link.category}
                                onMouseDown={() => handlePresetClick(link.category)}
                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                            >
                                <span>{link.label}</span>
                                <svg
                                    className="w-4 h-4 text-gray-400 ml-2"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                                    />
                                </svg>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </form>
    );
}
