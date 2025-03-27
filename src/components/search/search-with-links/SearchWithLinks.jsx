import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  getFirestore,
  collection,
  query as firestoreQuery,
  orderBy,
  limit,
  getDocs
} from "firebase/firestore";
import { useModels } from "../../../contexts/modelsContext";

export function SearchWithLinks() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const [artistResults, setArtistResults] = useState([]);
  const [modelResults, setModelResults] = useState([]);

  const containerRef = useRef(null);
  const navigate = useNavigate();
  const db = getFirestore();
  const { models } = useModels();

  // Example preset categories
  const presetLinks = [
    { label: "Search Artworks", category: "artworks" },
    { label: "Search Artists", category: "artists" },
    { label: "Search Studios", category: "studios" },
    { label: "Search Digital Products", category: "digital" },
    { label: "Search Prints", category: "prints" }
  ];

  /**
   * Whenever the dropdown is shown and the user has typed something in searchTerm,
   * we run a small "debounced" local + Firestore search.
   */
  useEffect(() => {
    if (!showDropdown) {
      // No need to search if dropdown is hidden
      return;
    }
    if (!searchTerm.trim()) {
      // Clear if empty
      setArtistResults([]);
      setModelResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        // 1) fetch top 50 artists from Firestore
        const colRef = collection(db, "users");
        const snap = await getDocs(
          firestoreQuery(colRef, orderBy("displayName"), limit(50))
        );
        const allArtists = snap.docs.map(doc => ({
          uid: doc.id,
          ...doc.data()
        }));

        // Filter locally by substring
        const filteredArtists = allArtists.filter(a =>
          a.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setArtistResults(filteredArtists.slice(0, 5));
      } catch (err) {
        console.error("Error fetching artists:", err);
        setArtistResults([]);
      }

      // 2) local filter for models
      const filteredModels = models.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setModelResults(filteredModels.slice(0, 5));
    }, 300);

    return () => clearTimeout(timer);
  }, [showDropdown, searchTerm, db, models]);

  /** Pressing Enter => go to /search?category=all&query=... */
  const handleKeyDown = e => {
    if (e.key === "Enter") {
      e.preventDefault();
      const queryValue = searchTerm.trim();
      if (queryValue) {
        navigate(`/search?category=all&query=${encodeURIComponent(queryValue)}`);
      }
      setShowDropdown(false);
    }
  };

  /** On focus, show the dropdown (unless the user has clicked outside) */
  const handleFocus = () => {
    setShowDropdown(true);
  };

  /**
   * "See all" row => if typed something, pass it to query=;
   * if user typed nothing, we'll pass "all" or simply do an empty string
   */
  const handleSeeAll = () => {
    const queryValue = searchTerm.trim() || "all";
    navigate(`/search?category=all&query=${encodeURIComponent(queryValue)}`);
    setShowDropdown(false);
  };

  // Clicking an artist
  const handleArtistSelect = uid => {
    navigate(`/artist/${uid}`);
    setShowDropdown(false);
  };

  // Clicking a model
  const handleModelSelect = id => {
    navigate(`/model/${id}`);
    setShowDropdown(false);
  };

  /**
   * Clicking a preset category link => pass the typed searchTerm (if any).
   * If user typed nothing, we can just pass "all" or an empty string.
   */
  const handlePresetClick = cat => {
    const queryValue = searchTerm.trim() || "all";
    navigate(`/search?category=${cat}&query=${encodeURIComponent(queryValue)}`);
    setShowDropdown(false);
  };

  /** Hide dropdown on outside click (but do NOT reset the text input). */
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full max-w-[800px]" ref={containerRef}>
      {/* Always visible search input */}
      <input
        type="text"
        className="border-2 border-gray-300 text-sm rounded-full w-full py-2 px-4 focus:outline-none focus:border-blue-500"
        placeholder="Search 3D models..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
      />

      {showDropdown && (
        <div className="absolute top-[110%] left-0 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 z-50">
          <ul className="py-2 max-h-80 overflow-auto text-sm">
            {/* Dynamic results if user typed something */}
            {searchTerm.trim() &&
              (artistResults.length > 0 || modelResults.length > 0) && (
                <>
                  {/* Up to 5 artist results */}
                  {artistResults.map(a => (
                    <li
                      key={`artist-${a.uid}`}
                      onClick={() => handleArtistSelect(a.uid)}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      <div className="font-medium">{a.displayName}</div>
                      <div className="text-xs text-gray-500">Artist</div>
                    </li>
                  ))}

                  {/* Up to 5 model results */}
                  {modelResults.map(m => (
                    <li
                      key={`model-${m.id}`}
                      onClick={() => handleModelSelect(m.id)}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      <div className="font-medium">{m.name}</div>
                      <div className="text-xs text-gray-500">Model</div>
                    </li>
                  ))}

                  {/* "See all" row */}
                  <li
                    onClick={handleSeeAll}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer font-medium"
                  >
                    See all results for <strong>{searchTerm}</strong>
                  </li>

                  {/* Divider */}
                  <hr className="my-2 border-gray-200" />
                </>
              )}

            {/* Preset links (categories) */}
            {presetLinks.map(link => (
              <li
                key={link.category}
                onClick={() => handlePresetClick(link.category)}
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
    </div>
  );
}
