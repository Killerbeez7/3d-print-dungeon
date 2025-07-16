import { memo } from "react";

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
                    className={`${className} absolute inset-0 w-full h-full object-cover aspect-ratio: 1 / 1`}
                    src={src}
                    alt={alt}
                    width={width}
                    height={height}
                    onLoad={() => {
                        if (index === loadIndex && onLoad) onLoad();
                    }}
                />
            )}
        </div>
    );
});
