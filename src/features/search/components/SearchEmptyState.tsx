import { Search } from "lucide-react";

import { buttonClassName } from "@/components";
import { MODEL_CATEGORIES } from "@/features/models/constants/modelCategories";
import { StatePanel } from "@/features/shared/components/StatePanel";
import { useFilters } from "../hooks/useFilters";

const QUICK_PICKS = 8;

/** Before the first search: suggest categories as one-tap starting points. */
export const SearchEmptyState = () => {
  const { filters, setFilters } = useFilters();

  return (
    <StatePanel
      icon={Search}
      headingLevel="h2"
      className="min-h-[50vh]"
      title="What are you printing next?"
      actions={MODEL_CATEGORIES.slice(0, QUICK_PICKS).map((category) => (
        <button
          key={category.id}
          type="button"
          onClick={() => setFilters({ ...filters, categoryIds: [category.id] })}
          className={buttonClassName({ variant: "secondary", size: "sm", className: "[--cut:6px]" })}
        >
          {category.name}
        </button>
      ))}
    >
      Type a name, a tag or a description, or start from a category.
    </StatePanel>
  );
};
