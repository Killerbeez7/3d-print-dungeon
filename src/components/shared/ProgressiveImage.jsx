import { useState } from "react";
import PropTypes from "prop-types";
import { getThumbnailUrl, THUMBNAIL_SIZES } from "@/utils/imageUtils";

export const ProgressiveImage = ({ src, alt, className = "", useCase = "card" }) => {
    const [highLoaded, setHighLoaded] = useState(false);

    // Generate appropriate thumbnail for low-res placeholder
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
            {/* low-res blurred placeholder */}
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

            {/* high-res image */}
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

ProgressiveImage.propTypes = {
    src: PropTypes.string.isRequired,
    alt: PropTypes.string.isRequired,
    className: PropTypes.string,
    useCase: PropTypes.oneOf(["card", "hero", "xlarge", "grid", "thumbnail"]),
};
