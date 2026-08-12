import { useState, useEffect, type ChangeEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { ROUTES } from "@/constants/routeConstants";
import type { SearchTab } from "../types/search";

export const useSearchPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const queryParam = searchParams.get("query") ?? "";

  const [localQuery, setLocalQuery] = useState<string>(queryParam);
  const [debouncedQuery, setDebouncedQuery] = useState<string>(queryParam.trim());

  const activeTab: SearchTab = "artworks";

  useEffect(() => {
    if (searchParams.has("sort_by")) {
      return;
    }

    setSearchParams((current) => {
      const next = new URLSearchParams(current);

      next.set("sort_by", "relevance");

      return next;
    });
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    setLocalQuery(queryParam);
    setDebouncedQuery(queryParam.trim());
  }, [queryParam]);

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

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setLocalQuery(event.target.value);
  };

  const handleClear = () => {
    setLocalQuery("");
    setDebouncedQuery("");

    setSearchParams((current) => {
      const next = new URLSearchParams(current);

      next.delete("query");

      return next;
    });
  };

  const handleTabSwitch = (tab: SearchTab) => {
    if (tab === "artworks") {
      navigate(`${ROUTES.SEARCH}?sort_by=relevance`);

      return;
    }

    navigate(`${ROUTES.SEARCH_ARTISTS}?sort_by=followers`);
  };

  return {
    localQuery,
    debouncedQuery,
    activeTab,
    handleInputChange,
    handleClear,
    handleTabSwitch,
  };
};
