import { memo } from "react";

/**
*Example usage:

<SequentialImage
    index={idx}
    loadIndex={loadIndex}
    src={art.thumbnailUrl}
    alt={art.title}
    onLoad={bumpIndex}
    width={400}
    height={400}
/>
 **/

export interface SequentialImageProps {
    src: string;
    alt: string;
    index: number;
    loadIndex: number;
    className?: string;
    onLoad?: () => void;
    placeholderStyle?: React.CSSProperties;
    width: number;
    height: number;
}

export const SequentialImage = memo(function SequentialImage({
    src,
    alt,
    index,
    loadIndex,
    className = "",
    onLoad,
    placeholderStyle = {},
    width,
    height,
}: SequentialImageProps) {
    const shouldLoad = index <= loadIndex;

    return (
        <div
            style={{
                position: "relative",
                width: "100%",
                paddingBottom: "100%",
                background: "#333",
                ...(shouldLoad ? {} : placeholderStyle),
            }}
        >
            {shouldLoad && (
                <img
                    className={`${className} absolute inset-0 w-full h-full object-cover aspect-ratio: 1 / 1 select-none`}
                    src={src}
                    alt={alt}
                    width={width}
                    height={height}
                    draggable={false}
                    onLoad={() => {
                        if (index === loadIndex && onLoad) onLoad();
                    }}
                />
            )}
        </div>
    );
});
