import { useState } from "react";
import { getThumbnailUrl, THUMBNAIL_SIZES } from "@/utils/imageUtils";

export type ProgressiveImageUseCase = "card" | "hero" | "xlarge" | "grid" | "thumbnail";

export interface ProgressiveImageProps {
    src: string;
    alt: string;
    className?: string;
    useCase?: ProgressiveImageUseCase;
}

export const ProgressiveImage = ({
    src,
    alt,
    className = "",
    useCase = "card",
}: ProgressiveImageProps) => {
    const [highLoaded, setHighLoaded] = useState(false);

    const lowResSrc = getThumbnailUrl(src, THUMBNAIL_SIZES.SMALL);
    const highResSrc =
        useCase === "hero" || useCase === "xlarge"
            ? getThumbnailUrl(src, THUMBNAIL_SIZES.XLARGE)
            : getThumbnailUrl(src, THUMBNAIL_SIZES.LARGE);

    return (
        <div
            className={`relative overflow-hidden ${className}`}
            style={{ backgroundColor: "var(--bg-surface)" }}
            role="img"
            aria-label={alt}
        >
            <img
                src={lowResSrc ?? undefined}
                alt=""
                aria-hidden="true"
                className={`
          absolute inset-0 w-full h-full object-cover
          filter blur-lg scale-110
          transition-opacity duration-500
          ${highLoaded ? "opacity-0" : "opacity-100"}
        `}
            />

            <img
                src={highResSrc || src}
                alt={alt}
                loading="lazy"
                onLoad={() => setHighLoaded(true)}
                className={`
          absolute inset-0 w-full h-full object-cover
          transition-opacity duration-700
          ${highLoaded ? "opacity-100" : "opacity-0"}
        `}
            />
        </div>
    );
};
