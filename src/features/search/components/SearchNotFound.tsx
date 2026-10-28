import { Search } from "lucide-react";

interface SearchNotFoundProps {
  msg: string;
}

export const SearchNotFound = ({ msg }: SearchNotFoundProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="chamfer mb-6 flex size-16 items-center justify-center bg-muted text-txt-muted [--cut:12px]">
        <Search className="size-7" aria-hidden="true" />
      </span>

      <h2 className="text-xl font-medium text-txt-primary">{msg}</h2>
    </div>
  );
};
