import { useState, useEffect, useRef, type FormEvent, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";

import { ROUTES } from "@/constants/routeConstants";
import { searchArtists } from "@/features/search/services/searchService";
import type { SearchTab } from "../types/search";
import type { ArtistData } from "@/features/artists/types/artists";
import { toUrlSafeUsername } from "@/utils/stringUtils";

export function GlobalSearch() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [artistResults, setArtistResults] = useState<ArtistData[]>([]);
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);

  const containerRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // "/" focuses search from anywhere, unless the user is already typing.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;
      if (!inputRef.current || inputRef.current.offsetParent === null) return;
      event.preventDefault();
      inputRef.current.focus();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;

      setIsMobile(mobile);

      if (mobile) {
        setShowDropdown(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!showDropdown) {
      return;
    }

    if (!searchTerm.trim()) {
      setArtistResults([]);

      return;
    }

    const timer = setTimeout(async () => {
      try {
        const artists = await searchArtists(searchTerm, 5);

        setArtistResults(artists);
      } catch (error) {
        console.error("Error fetching artists:", error);

        setArtistResults([]);
      }
    }, 300);

    return () => window.clearTimeout(timer);
  }, [showDropdown, searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current) {
        return;
      }

      if (containerRef.current.contains(event.target as Node)) {
        return;
      }

      setShowDropdown(false);
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setArtistResults([]);
    setShowDropdown(false);

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const query = searchTerm.trim();

    if (query) {
      navigate(`${ROUTES.SEARCH}?sort_by=relevance&query=${encodeURIComponent(query)}`);
    } else {
      navigate(`${ROUTES.SEARCH}?sort_by=relevance`);
    }

    handleClearSearch();
  };

  const handlePresetClick = (tab: SearchTab) => {
    const query = searchTerm.trim();

    if (tab === "artworks") {
      if (query) {
        navigate(`${ROUTES.SEARCH}?sort_by=relevance&query=${encodeURIComponent(query)}`);
      } else {
        navigate(`${ROUTES.SEARCH}?sort_by=relevance`);
      }

      handleClearSearch();

      return;
    }

    if (query) {
      navigate(
        `${ROUTES.SEARCH_ARTISTS}?sort_by=followers&query=${encodeURIComponent(query)}`
      );
    } else {
      navigate(`${ROUTES.SEARCH_ARTISTS}?sort_by=followers`);
    }

    handleClearSearch();
  };

  const handleFocus = () => {
    if (isMobile) {
      return;
    }

    setShowDropdown(true);
  };

  const handleArtistSelect = (artist: ArtistData) => {
    const username = toUrlSafeUsername(artist.username);

    navigate(`/${username}`);

    handleClearSearch();
  };

  return (
    <form
      ref={containerRef}
      onSubmit={handleSubmit}
      className="relative w-full max-w-[1000px]"
    >
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-txt-muted"
        aria-hidden="true"
      />

      <input
        ref={inputRef}
        type="search"
        placeholder="Search models and artists"
        aria-label="Search models and artists"
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={handleFocus}
        className="h-10 w-full rounded-lg border border-br-secondary bg-surface-card py-2 pl-9 pr-10 text-sm text-txt-primary transition-[border-color,box-shadow] placeholder:text-txt-muted hover:border-br-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25 [&::-webkit-search-cancel-button]:hidden"
      />

      {searchTerm ? (
        <button
          type="button"
          onClick={handleClearSearch}
          className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-txt-muted hover:bg-muted hover:text-txt-primary"
          aria-label="Clear search"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      ) : (
        <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded border border-br-secondary px-1.5 font-mono text-[0.7rem] text-txt-muted md:block">
          /
        </kbd>
      )}

      {/* Search dropdown */}
      {!isMobile && showDropdown && (
        <div className="absolute left-0 top-full z-50 mt-2 w-full overflow-hidden rounded-xl border border-br-secondary bg-surface-elevated text-txt-primary shadow-2xl shadow-black/40">
          <ul className="py-2 max-h-80 overflow-auto text-sm">
            {searchTerm.trim() && artistResults.length > 0 && (
              <>
                {/* Search results */}
                {artistResults.map((artist) => (
                  <li
                    key={`artist-${artist.uid}`}
                    onMouseDown={() => handleArtistSelect(artist)}
                    className="cursor-pointer px-3 py-2 hover:bg-surface-card"
                  >
                    <div className="font-medium">{artist.displayName}</div>
                    <div className="text-xs text-txt-muted">Artist</div>
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
