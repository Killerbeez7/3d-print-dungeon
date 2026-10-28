import { Search, X } from "lucide-react";
import type { ChangeEvent } from "react";

interface SearchInputProps {
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  placeholder?: string;
}

export const SearchInput = ({
  value,
  onChange,
  onClear,
  placeholder = "Search models and artists",
}: SearchInputProps) => {
  return (
    <div className="relative">
      <Search
        className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-txt-muted sm:left-5 sm:size-6"
        aria-hidden="true"
      />

      <input
        type="search"
        enterKeyHint="search"
        aria-label={placeholder}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={(event) => {
          if (event.key === "Escape" && value) onClear();
        }}
        className="h-14 w-full rounded-lg border border-br-input bg-page pl-12 pr-12 text-lg text-txt-primary transition-colors placeholder:text-txt-muted focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/20 sm:h-16 sm:pl-14 sm:text-xl [&::-webkit-search-cancel-button]:appearance-none"
      />

      {value && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-md text-txt-muted transition-colors hover:bg-muted hover:text-txt-primary"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
};
