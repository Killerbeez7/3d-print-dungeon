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
        <div className="max-w-xl mx-auto mb-4 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <FontAwesomeIcon icon={faSearch} />
            </span>
            <input
                type="text"
                placeholder="Search..."
                value={value}
                onChange={onChange}
                className="w-full border border-br-primary rounded-full px-4 py-2 pl-10 pr-10 focus:outline-none focus:border-accent"
            />
            {value && (
                <button
                    type="button"
                    onClick={onClear}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                    <FontAwesomeIcon icon={faTimes} />
                </button>
            )}
        </div>
    );
}; 