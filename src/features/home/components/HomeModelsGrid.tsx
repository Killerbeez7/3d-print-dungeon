import type { ModelData } from "@/features/models/types/model";
import { ModelCard, ModelCardSkeleton } from "./ModelCard";

// Edge-to-edge gallery with hairline gaps.
const gridClass =
  "grid grid-cols-2 gap-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7";

// The first rows load eagerly so the grid paints without waiting on lazy loading.
const EAGER_COUNT = 7;

export const HomeModelsGrid = ({ models }: { models: ModelData[] }) => {
  return (
    <div className={gridClass}>
      {models.map((model, index) => (
        <ModelCard key={model.id} model={model} priority={index < EAGER_COUNT} />
      ))}
    </div>
  );
};

export const HomeModelsGridSkeleton = ({ count = 14 }: { count?: number }) => (
  <div className={gridClass} role="status" aria-label="Loading models">
    {Array.from({ length: count }, (_, index) => (
      <ModelCardSkeleton key={index} />
    ))}
  </div>
);
