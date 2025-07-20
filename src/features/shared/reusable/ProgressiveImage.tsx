import { useState } from "react";
import { getThumbnailUrl } from "@/utils/imageUtils";

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

    const lowResSrc = getThumbnailUrl(src, "SMALL") || getThumbnailUrl(src, "MEDIUM") || src;
    let highResSrc: string | null;
    switch (useCase) {
        case "hero":
        case "xlarge":
            highResSrc = getThumbnailUrl(src, "XLARGE");
            break;
        case "grid":
            highResSrc = getThumbnailUrl(src, "MEDIUM"); // 400×400 thumb for grid cards
            break;
        default:
            highResSrc = getThumbnailUrl(src, "LARGE");
    }

    return (
        <div
            className={`relative overflow-hidden ${className}`}
            style={{ backgroundColor: "var(--bg-surface)" }}
            role="img"
            aria-label={alt}
        >
            <img
                src={lowResSrc}
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
