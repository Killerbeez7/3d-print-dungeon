import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Box } from "lucide-react";

import type { ModelData } from "@/features/models/types/model";
import { reportThumbResult, thumbsLikelyMissing } from "@/features/models/utils/imageVariants";
import { getThumbnailUrl } from "@/utils/imageUtils";

type Stage = "thumb" | "original" | "error";

const formatPrice = (price: number, currency = "usd") => {
  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(price);
  } catch {
    return `${price}`;
  }
};

// Matches the gallery columns in HomeModelsGrid.
const SIZES =
  "(min-width: 1536px) 15vw, (min-width: 1280px) 17vw, (min-width: 1024px) 20vw, (min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw";

interface ModelCardProps {
  model: ModelData;
  priority?: boolean;
}

/** Gallery tile: edge-to-edge render, details on hover (always on touch). */
export const ModelCard = ({ model, priority = false }: ModelCardProps) => {
  const original = model.renderPrimaryUrl ?? null;
  const thumbs = useMemo(() => {
    if (thumbsLikelyMissing()) return null;
    const small = getThumbnailUrl(original, "MEDIUM");
    const large = getThumbnailUrl(original, "LARGE");
    return small && large && small !== original
      ? { src: small, srcSet: `${small} 400w, ${large} 800w` }
      : null;
  }, [original]);

  const [stage, setStage] = useState<Stage>(thumbs ? "thumb" : original ? "original" : "error");
  const [loaded, setLoaded] = useState(false);

  const handleLoad = useCallback(() => {
    if (stage === "thumb") reportThumbResult(true);
    setLoaded(true);
  }, [stage]);

  const handleError = useCallback(() => {
    if (stage === "thumb") {
      reportThumbResult(false);
      setStage(original ? "original" : "error");
    } else {
      setStage("error");
    }
  }, [stage, original]);

  // Cached images can finish loading before React attaches onLoad.
  const imageRef = useCallback(
    (image: HTMLImageElement | null) => {
      if (image?.complete) {
        if (image.naturalWidth > 0) handleLoad();
        else handleError();
      }
    },
    [handleLoad, handleError]
  );

  const showPrice = Boolean(model.isPaid && model.price);

  return (
    <Link
      to={`/model/${model.id}`}
      className="reveal-print group relative block overflow-hidden bg-muted focus-visible:outline-offset-[-3px]"
    >
      <div className="tile-scan relative aspect-square overflow-hidden">
        {stage !== "error" && (
          <img
            key={stage}
            ref={imageRef}
            src={stage === "thumb" ? thumbs?.src : (original ?? undefined)}
            srcSet={stage === "thumb" ? thumbs?.srcSet : undefined}
            sizes={stage === "thumb" ? SIZES : undefined}
            alt=""
            width={400}
            height={400}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : undefined}
            decoding="async"
            draggable={false}
            onLoad={handleLoad}
            onError={handleError}
            className={`absolute inset-0 size-full select-none object-cover transition-[opacity,transform] duration-700 ease-forge group-hover:scale-[1.06] ${
              loaded ? "opacity-100" : "opacity-0"
            }`}
          />
        )}

        {stage !== "error" && !loaded && (
          <div className="skeleton-print absolute inset-0" aria-hidden="true" />
        )}

        {stage === "error" && (
          <div className="bg-buildplate absolute inset-0 flex items-center justify-center text-txt-muted">
            <Box className="size-8" aria-hidden="true" />
          </div>
        )}

        {showPrice && (
          <span className="chamfer absolute left-2 top-2 bg-ember-fill px-2 py-1 font-mono text-[0.7rem] font-semibold leading-none text-ember-on [--cut:5px]">
            {formatPrice(model.price as number, model.currency)}
          </span>
        )}

        <div className="tile-caption absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent p-3 pt-12">
          <h3 className="truncate text-sm font-semibold text-white">{model.name}</h3>
          {model.uploaderDisplayName && (
            <p className="mt-0.5 truncate text-xs text-white/70">{model.uploaderDisplayName}</p>
          )}
        </div>
      </div>
    </Link>
  );
};

export const ModelCardSkeleton = () => (
  <div className="skeleton-print aspect-square" aria-hidden="true" />
);
