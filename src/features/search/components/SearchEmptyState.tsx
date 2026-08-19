import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

interface SearchEmptyStateProps {
  description: string;
}

export const SearchEmptyState = ({ description }: SearchEmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <FontAwesomeIcon
        icon={faSearch}
        className="mb-6 text-6xl text-txt-muted opacity-40"
      />

      <h2 className="mb-2 text-xl font-medium text-txt-primary">
        What would you like to search for?
      </h2>

      <p className="max-w-md text-base text-txt-secondary">{description}</p>
    </div>
  );
};
