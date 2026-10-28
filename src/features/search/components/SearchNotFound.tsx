import { SearchX } from "lucide-react";

import { StatePanel } from "@/features/shared/components/StatePanel";

interface SearchNotFoundProps {
  msg: string;
  hint?: string;
}

export const SearchNotFound = ({ msg, hint = "Try fewer words or another spelling." }: SearchNotFoundProps) => (
  <StatePanel icon={SearchX} title={msg} headingLevel="h2" className="min-h-[40vh]">
    {hint}
  </StatePanel>
);
