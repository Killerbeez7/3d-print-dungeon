import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

export const SearchNotFound = ({ msg }: { msg: string }) => {
    return (
        <div className="flex flex-col items-center justify-center text-center">
            <FontAwesomeIcon
                icon={faSearch}
                className="text-8xl text-txt-muted mb-8 opacity-50"
            />
            <h2 className="text-xl font-medium text-txt-primary mb-3">{msg}</h2>
        </div>
    );
};
