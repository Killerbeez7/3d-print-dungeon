import { useContext } from "react";
import { FiltersContext } from "../context/filtersContext";
import type { FiltersContextValue } from "../types/filterTypes";

export const useFilters = (): FiltersContextValue => {
    const ctx = useContext(FiltersContext);
    if (!ctx) throw new Error("useFilters must be inside Provider");
    return ctx;
};
