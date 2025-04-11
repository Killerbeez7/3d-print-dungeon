import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSearch } from "../../contexts/searchContext";
import {
    getFirestore,
    collection,
    query as firestoreQuery,
    orderBy,
    limit,
    getDocs,
} from "firebase/firestore";

export function GlobalSearch() {
    const {
        searchTerm,
        setSearchTerm,
        setActiveTab,
        showDropdown,
        setShowDropdown,
        handleClearSearch,
    } = useSearch();
    const [artistResults, setArtistResults] = useState([]);
    const containerRef = useRef(null);
    const navigate = useNavigate();
    const db = getFirestore();

    // Update global search term as the user types.
    const handleInputChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Fetch top 5 artists for the dropdown while user types.
    useEffect(() => {
        if (!showDropdown) return;
        if (!searchTerm.trim()) {
            setArtistResults([]);
            return;
        }
        const timer = setTimeout(async () => {
            try {
                const colRef = collection(db, "users");
                const q = firestoreQuery(colRef, orderBy("displayName"), limit(50));
                const snap = await getDocs(q);
                const allArtists = snap.docs.map((doc) => ({
                    uid: doc.id,
                    ...doc.data(),
                }));
                const filteredArtists = allArtists.filter((a) =>
                    a.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
                );
                setArtistResults(filteredArtists.slice(0, 5));
            } catch (err) {
                console.error("Error fetching artists:", err);
                setArtistResults([]);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [showDropdown, searchTerm, db]);

    // On submit, update URL (static query) and clear the global input.
    const handleSubmit = (e) => {
        e.preventDefault();
        const queryValue = searchTerm.trim();
        navigate(`/search?query=${encodeURIComponent(queryValue)}`);
        setSearchTerm("");
        setShowDropdown(false);
        document.activeElement.blur();
    };

    // Clicking a preset link sets the active tab accordingly,
    // navigates to Dynamic Search with the current query, and clears the global input.
    const handlePresetClick = (preset) => {
        setActiveTab(preset);
        const currentQuery = searchTerm.trim();
        navigate(`/search?query=${encodeURIComponent(currentQuery)}`);
        setSearchTerm("");
        setShowDropdown(false);
    };

    // Close dropdown on click outside (but do not reset the input).
    useEffect(() => {
        function handleClickOutside(e) {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [setShowDropdown]);

    const handleFocus = () => {
        setShowDropdown(true);
    };

    // Clicking on an artist in the dropdown navigates to their profile.
    const handleArtistSelect = (uid) => {
        navigate(`/artist/${uid}`);
        setShowDropdown(false);
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="relative w-full max-w-[1000px]"
            ref={containerRef}
        >
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <FontAwesomeIcon icon={faSearch} />
            </span>
            <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={handleInputChange}
                onFocus={handleFocus}
                className="border-2 border-gray-300 rounded-full w-full text-sm focus:outline-none focus:border-blue-500 py-2 pl-10 pr-10"
            />
            {searchTerm && (
                <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                    <FontAwesomeIcon icon={faTimes} />
                </button>
            )}
            {showDropdown && (
                <div className="absolute top-[110%] left-0 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 z-50">
                    <ul className="py-2 max-h-80 overflow-auto text-sm">
                        {searchTerm.trim() && artistResults.length > 0 && (
                            <>
                                {artistResults.map((a) => (
                                    <li
                                        key={`artist-${a.uid}`}
                                        onMouseDown={() => handleArtistSelect(a.uid)}
                                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                    >
                                        <div className="font-medium">{a.displayName}</div>
                                        <div className="text-xs text-gray-500">
                                            Artist
                                        </div>
                                    </li>
                                ))}
                                <hr className="my-2 border-gray-200" />
                            </>
                        )}
                        {/* Preset links */}
                        <li
                            onMouseDown={() => handlePresetClick("artworks")}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                        >
                            <span>Search Artworks</span>
                        </li>
                        <li
                            onMouseDown={() => handlePresetClick("artists")}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                        >
                            <span>Search Artists</span>
                        </li>
                    </ul>
                </div>
            )}
        </form>
    );
}
