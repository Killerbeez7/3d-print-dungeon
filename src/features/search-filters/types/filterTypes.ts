export interface ProductFilters {
  categoryIds?: string[];
  search?: string;
  limit?: number;
  hideAI?: boolean;
} 

export interface FiltersContextValue {
  filters: ProductFilters;
  setFilters: (f: ProductFilters) => void;
}
