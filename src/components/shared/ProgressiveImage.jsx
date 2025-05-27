import { useState } from "react";

export const ProgressiveImage = ({ lowResSrc, src, alt, className = "" }) => {
    const [highLoaded, setHighLoaded] = useState(false);

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
                src={src}
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
