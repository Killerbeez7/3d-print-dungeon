import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { Box } from "lucide-react";

import type { ModelData } from "@/features/models/types/model";

type ImageStatus = "loading" | "loaded" | "error";

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

interface ModelCardProps {
  model: ModelData;
  priority?: boolean;
}

export const ModelCard = ({ model, priority = false }: ModelCardProps) => {
  const [status, setStatus] = useState<ImageStatus>(
    model.renderPrimaryUrl ? "loading" : "error"
  );

  // Cached images can finish loading before React attaches onLoad.
  const imageRef = useCallback((image: HTMLImageElement | null) => {
    if (image?.complete) {
      setStatus(image.naturalWidth > 0 ? "loaded" : "error");
    }
  }, []);

  const showPrice = Boolean(model.isPaid && model.price);

  return (
    <Link
      to={`/model/${model.id}`}
      className="group block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
    >
      <div className="relative aspect-square overflow-hidden rounded-lg border border-br-subtle bg-muted transition-colors duration-200 group-hover:border-accent/50">
        {status !== "error" && (
          <img
            ref={imageRef}
            src={model.renderPrimaryUrl ?? ""}
            alt=""
            width={400}
            height={400}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            draggable={false}
            onLoad={() => setStatus("loaded")}
            onError={() => setStatus("error")}
            className={`size-full select-none object-cover transition duration-500 ease-out group-hover:scale-105 ${
              status === "loaded" ? "opacity-100" : "opacity-0"
            }`}
          />
        )}

        {status === "loading" && (
          <div className="absolute inset-0 animate-pulse bg-muted" aria-hidden="true" />
        )}

        {status === "error" && (
          <div className="absolute inset-0 flex items-center justify-center text-txt-muted">
            <Box className="size-8" aria-hidden="true" />
          </div>
        )}

        {showPrice && (
          <span className="absolute left-2 top-2 rounded-full bg-surface-overlay px-2 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
            {formatPrice(model.price as number, model.currency)}
          </span>
        )}
      </div>

      <div className="mt-2 min-w-0 px-0.5">
        <h3 className="truncate text-sm font-medium text-txt-primary">{model.name}</h3>
        {model.uploaderDisplayName && (
          <p className="mt-0.5 truncate text-xs text-txt-muted">by {model.uploaderDisplayName}</p>
        )}
      </div>
    </Link>
  );
};

export const ModelCardSkeleton = () => (
  <div aria-hidden="true">
    <div className="aspect-square animate-pulse rounded-lg bg-muted" />
    <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-muted" />
    <div className="mt-1.5 h-3 w-1/2 animate-pulse rounded bg-muted" />
  </div>
);
