import { ReactNode, useState } from "react";
import { FiltersContext } from "@/features/search-filters/context/filtersContext";
import type { ProductFilters, FiltersContextValue } from "../types/filterTypes";

interface FiltersProviderProps {
    children: ReactNode;
}

export const FiltersProvider = ({ children }: FiltersProviderProps) => {
    const [filters, setFilters] = useState<ProductFilters>({});

    const contextValue: FiltersContextValue = {
        filters,
        setFilters,
    };
    return (
        <FiltersContext.Provider value={contextValue}>{children}</FiltersContext.Provider>
    );
};
