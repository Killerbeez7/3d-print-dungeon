import { Search } from "lucide-react";

interface SearchEmptyStateProps {
  description: string;
}

export const SearchEmptyState = ({ description }: SearchEmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="chamfer mb-6 flex size-16 items-center justify-center bg-muted text-txt-muted [--cut:12px]">
        <Search className="size-7" aria-hidden="true" />
      </span>

      <h2 className="mb-2 text-xl font-medium text-txt-primary">
        What would you like to search for?
      </h2>

      <p className="max-w-md text-base text-txt-secondary">{description}</p>
    </div>
  );
};
