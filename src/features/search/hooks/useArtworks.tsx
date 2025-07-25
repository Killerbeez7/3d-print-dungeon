import { useFetchModels } from "@/features/models/hooks/useFetchModels";
import type { ProductFilters } from "@/features/search-filters/types/filterTypes";

export const useArtworks = (filters: ProductFilters, search: string) =>
  useFetchModels({ ...filters, search: search.trim() || undefined });
