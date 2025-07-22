import { createContext, useContext, useState, ReactNode } from "react";
import type { ProductFilters } from "./filterTypes";

interface FilterContextType {
  filters: ProductFilters;
  setFilters: (f: ProductFilters) => void;
}

const FilterCtx = createContext<FilterContextType | undefined>(undefined);

export const useProductFilters = () => {
  const ctx = useContext(FilterCtx);
  if (!ctx) throw new Error("useProductFilters must be inside Provider");
  return ctx;
};

export const ProductFilterProvider = ({ children }: { children: ReactNode }) => {
  const [filters, setFilters] = useState<ProductFilters>({});
  return (
    <FilterCtx.Provider value={{ filters, setFilters }}>
      {children}
    </FilterCtx.Provider>
  );
}; 