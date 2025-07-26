import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";
import type { ChangeEvent } from "react";

interface SearchInputProps {
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onClear: () => void;
}

export const SearchInput = ({ value, onChange, onClear }: SearchInputProps) => {
    return (
        <div className="max-w-2xl mx-auto relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-txt-muted pointer-events-none">
                <FontAwesomeIcon icon={faSearch} className="text-lg" />
            </span>
            <input
                type="text"
                placeholder="Search"
                value={value}
                onChange={onChange}
                className="
                    w-full border-2 border-br-secondary rounded-lg 
                    px-6 py-4 pl-12 pr-12 text-lg
                    bg-bg-primary text-txt-primary
                    focus:outline-none focus:border-br-primary
                    placeholder:text-txt-muted
                    transition-colors
                "
            />
            {value && (
                <button
                    type="button"
                    onClick={onClear}
                    className="
                        absolute right-4 top-1/2 -translate-y-1/2 
                        text-txt-muted hover:text-txt-primary
                        transition-colors
                    "
                >
                    <FontAwesomeIcon icon={faTimes} className="text-lg" />
                </button>
            )}
        </div>
    );
};
