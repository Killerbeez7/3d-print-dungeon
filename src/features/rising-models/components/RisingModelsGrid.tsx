import { ModelCard } from "@/features/models/components/ModelCard";

import type { ModelData } from "@/features/models/types/model";

interface RisingModelsGridProps {
  models: ModelData[];
}

export function RisingModelsGrid({ models }: RisingModelsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {models.map((model) => {
        return <ModelCard key={model.id} model={model} />;
      })}
    </div>
  );
}
