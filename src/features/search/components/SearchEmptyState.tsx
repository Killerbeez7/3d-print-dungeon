import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

export const SearchEmptyState = () => {
    return (
        <div className="flex flex-col items-center justify-center text-center py-20">
            <FontAwesomeIcon
                icon={faSearch}
                className="text-6xl text-gray-300 mb-4"
            />
            <h2 className="text-xl font-semibold text-txt-secondary mb-2">
                What would you like to search for?
            </h2>
            <p className="text-sm text-txt-secondary max-w-sm">
                Start your search with a keyword or add filtering options.
            </p>
        </div>
    );
}; 