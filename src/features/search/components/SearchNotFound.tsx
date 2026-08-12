import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

interface SearchNotFoundProps {
  msg: string;
}

export const SearchNotFound = ({ msg }: SearchNotFoundProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <FontAwesomeIcon
        icon={faSearch}
        className="mb-6 text-6xl text-txt-muted opacity-40"
      />

      <h2 className="text-xl font-medium text-txt-primary">{msg}</h2>
    </div>
  );
};
