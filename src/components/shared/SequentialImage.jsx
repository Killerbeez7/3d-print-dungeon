// src/components/shared/SequentialImage.jsx
import { memo } from "react";

export const SequentialImage = memo(function SequentialImage({
    src,
    alt,
    index,
    loadIndex,
    className = "",
    onLoad,
    placeholderStyle = {},
}) {
    // Only images with index ≤ loadIndex get a real src
    const shouldLoad = index <= loadIndex;

    return (
        <div
            style={{
                position: "relative",
                width: "100%",
                paddingBottom: "100%", // force square aspect
                background: "#333", // or your bg-surface
                ...(shouldLoad ? {} : placeholderStyle),
            }}
        >
            {shouldLoad && (
                <img
                    className={`${className} absolute inset-0 w-full h-full object-cover`}
                    src={src}
                    alt={alt}
                    onLoad={() => {
                        // Only fire once, for the image that just turned live
                        if (index === loadIndex) onLoad();
                    }}
                />
            )}
        </div>
    );
});
