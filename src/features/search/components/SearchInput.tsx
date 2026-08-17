import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";
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
        <FontAwesomeIcon icon={faSearch} className="text-lg" />
      </span>

      <input
        type="text"
        placeholder="Search models and artists"
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-br-secondary bg-page px-12 py-4 text-lg text-txt-primary transition-colors placeholder:text-txt-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15"
      />

      {value && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear search"
          className="absolute right-4 top-1/2 -translate-y-1/2 text-txt-muted transition-colors hover:text-txt-primary"
        >
          <FontAwesomeIcon icon={faTimes} className="text-lg" />
        </button>
      )}
    </div>
  );
};
