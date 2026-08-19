import { createContext } from "react";
import type { FiltersContextValue } from "@/features/search/types/filterTypes";

export const FiltersContext = createContext<FiltersContextValue | undefined>(undefined);
