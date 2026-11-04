import { useState } from "react";
import { Link } from "react-router-dom";
import { Box, X } from "lucide-react";

import { ModelCard } from "@/features/home/components/ModelCard";
import type { ModelData } from "@/features/models/types/model";
import { getThumbnailUrl } from "@/utils/imageUtils";

/** One small cover image: the thumbnail, falling back to the full render. */
const CoverImage = ({ model }: { model?: ModelData }) => {
  const original = model?.renderPrimaryUrl ?? null;
  const thumb = original ? getThumbnailUrl(original, "SMALL") : null;
  const [src, setSrc] = useState(thumb ?? original);
  if (!src) {
    return (
      <span className="flex items-center justify-center bg-surface-card text-txt-muted">
        {model && <Box className="size-5" aria-hidden="true" />}
      </span>
    );
  }
  return (
    <img
      src={src}
      alt=""
      loading="lazy"
      decoding="async"
      onError={() => setSrc(src === original ? null : original)}
      className="size-full bg-surface-card object-cover"
    />
  );
};

interface CollectionCardProps {
  to: string;
  title: string;
  count: number;
  /** Up to four models for the cover. */
  cover: (ModelData | undefined)[];
  icon?: React.ReactNode;
}

/** A shelf tile: 2 x 2 cover of the first models, name and count underneath. */
export const CollectionCard = ({ to, title, count, cover, icon }: CollectionCardProps) => (
  <Link
    to={to}
    className="group block rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
  >
    <span className="chamfer grid aspect-square grid-cols-2 grid-rows-2 gap-0.5 overflow-hidden bg-br-subtle [--cut:12px]">
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className="flex min-h-0 overflow-hidden">
          <span className="flex size-full transition-transform duration-500 ease-forge group-hover:scale-105 [&>*]:size-full">
            <CoverImage model={cover[i]} />
          </span>
        </span>
      ))}
    </span>
    <span className="mt-2.5 flex items-center gap-2">
      {icon}
      <span className="min-w-0 flex-1 truncate font-semibold text-txt-primary group-hover:text-accent">
        {title}
      </span>
      <span className="font-mono text-xs text-txt-muted">{count}</span>
    </span>
  </Link>
);

export const CollectionCardSkeleton = () => (
  <div>
    <div className="skeleton-print chamfer aspect-square [--cut:12px]" />
    <div className="skeleton-line mt-3 h-4 w-2/3" />
  </div>
);

export const shelfGridClass = "grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6";

interface ShelfModelsProps {
  models: ModelData[];
  removeLabel: string;
  onRemove: (modelId: string) => void;
}

/** The model gallery, with a small remove button on each tile. */
export const ShelfModels = ({ models, removeLabel, onRemove }: ShelfModelsProps) => (
  <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
    {models.map((model, index) => (
      <div key={model.id} className="group/shelf relative">
        <ModelCard model={model} priority={index < 7} />
        <button
          type="button"
          onClick={() => onRemove(model.id)}
          aria-label={`${removeLabel}: ${model.name}`}
          title={removeLabel}
          className="absolute right-2 top-2 z-10 flex size-8 items-center justify-center rounded-full bg-page/80 text-txt-primary backdrop-blur transition-[opacity,background-color] hover:bg-page focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-focus md:opacity-0 md:group-hover/shelf:opacity-100"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
    ))}
  </div>
);
