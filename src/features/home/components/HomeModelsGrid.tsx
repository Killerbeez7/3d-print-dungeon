import type { ModelData } from "@/features/models/types/model";
import { ModelCard, ModelCardSkeleton } from "./ModelCard";

const gridClass =
  "grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-x-4 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6";

// First row(s) load eagerly so the grid paints without waiting on lazy loading.
const EAGER_COUNT = 6;

export const HomeModelsGrid = ({ models }: { models: ModelData[] }) => {
  return (
    <div className={gridClass}>
      {models.map((model, index) => (
        <ModelCard key={model.id} model={model} priority={index < EAGER_COUNT} />
      ))}
    </div>
  );
};

export const HomeModelsGridSkeleton = ({ count = 12 }: { count?: number }) => (
  <div className={gridClass} role="status" aria-label="Loading models">
    {Array.from({ length: count }, (_, index) => (
      <ModelCardSkeleton key={index} />
    ))}
  </div>
);
