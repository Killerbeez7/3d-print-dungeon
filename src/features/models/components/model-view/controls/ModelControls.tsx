import React from "react";

interface ModelControlsProps {
    controlsVisible: boolean;
    autoRotate: boolean;
    isIOS: boolean;
    customFullscreen: boolean;
    isFullscreen: boolean;
    renderExtraUrls: string[];
    onToggleMenu: () => void;
    onToggleRotation: () => void;
    onResetView: () => void;
    onToggleFullscreen: () => void;
    onTakeScreenshot: () => void;
    onTouchStart: () => void;
    onTouchEnd: () => void;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
}

export const ModelControls: React.FC<ModelControlsProps> = ({
    controlsVisible,
    autoRotate,
    isIOS,
    customFullscreen,
    isFullscreen,
    renderExtraUrls,
    onToggleMenu,
    onToggleRotation,
    onResetView,
    onToggleFullscreen,
    onTakeScreenshot,
    onTouchStart,
    onTouchEnd,
    onMouseEnter,
    onMouseLeave,
}) => {
    if (renderExtraUrls.length === 0) return null;

    return (
        <div>
            {/* Toggle Arrow */}
            <div
                className={`${
                    (isIOS && customFullscreen) || isFullscreen
                        ? "fixed"
                        : "absolute"
                } bottom-0 left-1/2 transform -translate-x-1/2 cursor-pointer z-[999] transition-transform duration-300 ${
                    controlsVisible
                        ? "translate-y-full pointer-events-none"
                        : "translate-y-0"
                }`}
                onClick={controlsVisible ? undefined : onToggleMenu}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
                role="button"
                tabIndex={0}
                aria-label="Toggle Menu (M)"
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        onToggleMenu();
                    }
                }}
            >
                <div className="bg-black/30 backdrop-blur-sm px-4 py-2 rounded-t-lg group hover:bg-black/40 transition-colors relative">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-6 w-6 text-white transform transition-transform duration-300 ${
                            controlsVisible
                                ? "rotate-180 opacity-50"
                                : ""
                        }`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path
                            fillRule="evenodd"
                            d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                            clipRule="evenodd"
                        />
                    </svg>
                    <span
                        role="tooltip"
                        className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 text-xs bg-black/80 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none"
                    >
                        Toggle Menu (M)
                    </span>
                </div>
            </div>

            {/* Controls Bar */}
            <div
                className={`${
                    (isIOS && customFullscreen) || isFullscreen
                        ? "fixed"
                        : "absolute"
                } bottom-0 left-0 right-0 transition-transform duration-300 ease-in-out transform z-[9999] ${
                    controlsVisible
                        ? "translate-y-0"
                        : "translate-y-full pointer-events-none"
                }`}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
            >
                <div className="flex items-center justify-center gap-4 backdrop-blur-sm px-4 md:py-3 sm:py-1 shadow-lg bg-black/30">
                    <button
                        onClick={onToggleRotation}
                        disabled={!controlsVisible}
                        aria-label="Rotate (R)"
                        className={`p-2 rounded-full hover:bg-white/20 transition-colors group relative ${
                            !controlsVisible ? "opacity-50" : ""
                        }`}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className={`h-6 w-6 text-white ${
                                autoRotate ? "animate-spin" : ""
                            }`}
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <span
                            role="tooltip"
                            className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 text-xs bg-black/80 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none"
                        >
                            Rotate (R)
                        </span>
                    </button>

                    <div className="w-px h-6 bg-white/20"></div>

                    <button
                        onClick={onResetView}
                        disabled={!controlsVisible}
                        aria-label="Reset View (H)"
                        className={`p-2 rounded-full hover:bg-white/20 transition-colors group relative ${
                            !controlsVisible ? "opacity-50" : ""
                        }`}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 text-white"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
                            <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" />
                            <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" />
                        </svg>
                        <span
                            role="tooltip"
                            className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 text-xs bg-black/80 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none"
                        >
                            Reset View (H)
                        </span>
                    </button>

                    <button
                        onClick={onToggleFullscreen}
                        disabled={!controlsVisible}
                        aria-label="Fullscreen (F)"
                        className={`p-2 rounded-full hover:bg-white/20 transition-colors group relative ${
                            !controlsVisible ? "opacity-50" : ""
                        }`}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 text-white"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 111.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <span
                            role="tooltip"
                            className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 text-xs bg-black/80 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none"
                        >
                            Fullscreen (F)
                        </span>
                    </button>

                    <div className="w-px h-6 bg-white/20"></div>

                    <button
                        onClick={onTakeScreenshot}
                        disabled={!controlsVisible}
                        aria-label="Take Screenshot"
                        className={`p-2 rounded-full hover:bg-white/20 transition-colors group relative ${
                            !controlsVisible ? "opacity-50" : ""
                        }`}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 text-white"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <span
                            role="tooltip"
                            className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 text-xs bg-black/80 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none"
                        >
                            Screenshot
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};
