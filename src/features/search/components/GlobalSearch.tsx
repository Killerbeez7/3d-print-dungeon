import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";
import {
    useState,
    useEffect,
    useRef,
    type ChangeEvent,
    type FormEvent,
    type MouseEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import { useSearch } from "@/features/search/hooks/useSearch";
import {
    getFirestore,
    collection,
    query as firestoreQuery,
    orderBy,
    limit,
    getDocs,
} from "firebase/firestore";
import type { ArtistData } from "@/features/artists/types/artists";
import { toUrlSafeUsername } from "@/utils/stringUtils";

export function GlobalSearch() {
    const {
        searchTerm,
        setSearchTerm,
        setActiveTab,
        showDropdown,
        setShowDropdown,
        handleClearSearch,
    } = useSearch();
    const [artistResults, setArtistResults] = useState<ArtistData[]>([]);
    const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);
    const containerRef = useRef<HTMLFormElement>(null);
    const navigate = useNavigate();
    const db = getFirestore();

    // Check for mobile screen size
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
            if (window.innerWidth < 768) {
                setShowDropdown(false);
            }
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [setShowDropdown]);

    // Update global search term as the user types.
    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
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
                const q = firestoreQuery(colRef, orderBy("username"), limit(50));
                const snap = await getDocs(q);
                const allArtists: ArtistData[] = snap.docs.map((doc) => {
                    const data = doc.data();
                    return {
                        uid: doc.id,
                        email: data.email ?? null,
                        displayName: data.displayName ?? null,
                        username: data.username ?? null,
                        photoURL: data.photoURL ?? null,
                        ...data,
                    } as ArtistData;
                });
                const filteredArtists = allArtists.filter(
                    (a) =>
                        a.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const queryValue = searchTerm.trim();

        // Only add query parameter if there's actually a query
        if (queryValue) {
            navigate(`/search?sort_by=relevance&query=${encodeURIComponent(queryValue)}`);
        } else {
            navigate(`/search?sort_by=relevance`);
        }

        setActiveTab("artworks");
        setSearchTerm("");
        setShowDropdown(false);
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }
    };

    // Clicking a preset link sets the active tab accordingly,
    // navigates to Dynamic Search with the current query, and clears the global input.
    const handlePresetClick = (preset: string) => {
        setActiveTab(preset);
        const currentQuery = searchTerm.trim();

        // Navigate to the appropriate route based on the preset
        if (preset === "artworks") {
            if (currentQuery) {
                navigate(
                    `/search?sort_by=relevance&query=${encodeURIComponent(currentQuery)}`
                );
            } else {
                navigate(`/search?sort_by=relevance`);
            }
        } else {
            if (currentQuery) {
                navigate(
                    `/search/artists?sort_by=followers&query=${encodeURIComponent(
                        currentQuery
                    )}`
                );
            } else {
                navigate(`/search/artists?sort_by=followers`);
            }
        }

        setSearchTerm("");
        setShowDropdown(false);
    };

    // Close dropdown on click outside (but do not reset the input).
    useEffect(() => {
        function handleClickOutside(e: MouseEvent | globalThis.MouseEvent) {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target as Node)
            ) {
                setShowDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [setShowDropdown]);

    const handleFocus = () => {
        if (!isMobile) {
            setShowDropdown(true);
        }
    };

    // Clicking on an artist in the dropdown navigates to their profile.
    const handleArtistSelect = (artist: ArtistData) => {
        const urlSafeUsername = toUrlSafeUsername(artist.username);
        navigate(`/${urlSafeUsername}`);
        setShowDropdown(false);
        setSearchTerm("");
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="relative w-full max-w-[1000px]"
            ref={containerRef}
        >
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-muted pointer-events-none">
                <FontAwesomeIcon icon={faSearch} />
            </span>
            <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={handleInputChange}
                onFocus={handleFocus}
                className="border-2 text-txt-primary border-br-secondary rounded-full w-full text-sm focus:outline-none focus:border-accent-hover py-2 pl-10 pr-10"
            />
            {searchTerm && (
                <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-txt-muted hover:text-txt-secondary"
                >
                    <FontAwesomeIcon icon={faTimes} />
                </button>
            )}
            {!isMobile && showDropdown && (
                <div className="absolute top-[110%] left-0 w-full text-txt-primary bg-bg-primary border border-br-secondary rounded-md shadow-lg mt-1 z-50">
                    <ul className="py-2 max-h-80 overflow-auto text-sm">
                        {searchTerm.trim() && artistResults.length > 0 && (
                            <>
                                {artistResults.map((a) => (
                                    <li
                                        key={`artist-${a.uid}`}
                                        onMouseDown={() => handleArtistSelect(a)}
                                        className="px-3 py-2 hover:--btn-secondary-hover cursor-pointer"
                                    >
                                        <div className="font-medium">{a.displayName}</div>
                                        <div className="text-xs text-txt-muted">
                                            Artist
                                        </div>
                                    </li>
                                ))}
                                <hr className="my-2 border-br-secondary" />
                            </>
                        )}
                        {/* Preset links */}
                        <li
                            onMouseDown={() => handlePresetClick("artworks")}
                            className={`px-3 py-2 cursor-pointer flex justify-between items-center text-txt-secondary hover:text-txt-primary`}
                        >
                            <span>Search Artworks</span>
                        </li>
                        <li
                            onMouseDown={() => handlePresetClick("artists")}
                            className={`px-3 py-2 cursor-pointer flex justify-between items-center text-txt-secondary hover:text-txt-primary`}
                        >
                            <span>Search Artists</span>
                        </li>
                    </ul>
                </div>
            )}
        </form>
    );
}
