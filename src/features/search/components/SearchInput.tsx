import { Search, X } from "lucide-react";
import type { ChangeEvent } from "react";

interface SearchInputProps {
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
}

export const SearchInput = ({ value, onChange, onClear }: SearchInputProps) => {
  return (
    <div className="relative mx-auto max-w-2xl">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-txt-muted">
        <Search className="size-5" aria-hidden="true" />
      </span>

      <input
        type="text"
        placeholder="Search models and artists"
        value={value}
        onChange={onChange}
        className="h-14 w-full rounded-lg border border-br-input bg-surface-card px-12 text-lg text-txt-primary transition-colors placeholder:text-txt-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
      />

      {value && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear search"
          className="absolute right-4 top-1/2 -translate-y-1/2 text-txt-muted transition-colors hover:text-txt-primary"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
};
