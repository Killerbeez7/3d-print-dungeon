import { memo } from "react";
import PropTypes from "prop-types";

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
}) {
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
                    className={`${className} absolute inset-0 w-full h-full object-cover`}
                    src={src}
                    alt={alt}
                    width={width}
                    height={height}
                    onLoad={() => {
                        
                        if (index === loadIndex) onLoad();
                    }}
                />
            )}
        </div>
    );
});

SequentialImage.propTypes = {
    src: PropTypes.string.isRequired,
    alt: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,
    loadIndex: PropTypes.number.isRequired,
    className: PropTypes.string,
    onLoad: PropTypes.func,
    placeholderStyle: PropTypes.object,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
};
