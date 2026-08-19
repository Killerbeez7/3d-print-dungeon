export interface ProductFilters {
  categoryIds?: string[];
  search?: string;
  limit?: number;
  hideAI?: boolean;
  sortBy?: string;
} 

export interface FiltersContextValue {
  filters: ProductFilters;
  setFilters: (f: ProductFilters) => void;
}
