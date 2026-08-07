import { useState, useEffect, type ChangeEvent } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useSearch } from "./useSearch";

export const useArtistsSearchPage = () => {
  const navigate = useNavigate();

  const { activeTab, setActiveTab } = useSearch();
  const [searchParams, setSearchParams] = useSearchParams();
  const [localQuery, setLocalQuery] = useState(() => searchParams.get("query") ?? "");
  const [debouncedQuery, setDebouncedQuery] = useState(
    () => searchParams.get("query") ?? ""
  );

  // Ensure the artists tab has default sort
  useEffect(() => {
    if (activeTab === "artists" && !searchParams.has("sort_by")) {
      setSearchParams((current) => {
        const next = new URLSearchParams(current);

        next.set("sort_by", "followers");

        return next;
      });
    }
  }, [activeTab, searchParams, setSearchParams]);

  // Debounce search input and sync it with the URL
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const query = localQuery.trim();

      setDebouncedQuery(query);

      setSearchParams((current) => {
        const next = new URLSearchParams(current);

        if (query) {
          next.set("query", query);
        } else {
          next.delete("query");
        }

        return next;
      });
    }, 300);

    return () => {
      window.clearTimeout(timer);
    };
  }, [localQuery, setSearchParams]);

  const noSearchNoFilters = !debouncedQuery.trim();

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLocalQuery(e.target.value);
  };

  const handleClear = () => {
    setLocalQuery("");
  };

  const handleTabSwitch = (tab: string) => {
    setActiveTab(tab);

    setLocalQuery("");
    setDebouncedQuery("");

    if (tab === "artworks") {
      navigate("/search?sort_by=relevance");
      return;
    }

    navigate("/search/artists?sort_by=followers");
  };

  return {
    localQuery,
    debouncedQuery,
    activeTab,
    noSearchNoFilters,
    handleInputChange,
    handleClear,
    handleTabSwitch,
  };
};
