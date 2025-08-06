import { useState, useRef, useEffect } from "react";
import { FaArrowRight, FaArrowLeft } from "react-icons/fa";
import { fullscreenConfig } from "@/config/fullscreenConfig";
import { LazyImage } from "@/features/shared/reusable/LazyImage";
import type { ModelViewerElement } from "@google/model-viewer";

import type {
    ModelViewerProps,
    NavigationArrowProps,
    NavigationDotsProps,
} from "@/features/models/types/modelViewer";

const NavigationArrow = ({ direction, onClick }: NavigationArrowProps) => (
    <button
        onClick={onClick}
        className={`absolute ${
            direction === "left" ? "left-4" : "right-4"
        } top-1/2 transform -translate-y-1/2 flex items-center justify-center w-[35px] h-[35px] rounded-full bg-black/50 hover:bg-black/70 transition-all duration-200 z-40 group invisible md:visible`}
        aria-label={direction === "left" ? "Previous view" : "Next view"}
        type="button"
    >
        {direction === "left" ? (
            <FaArrowLeft className="text-white text-xl group-hover:scale-110 transition-transform" />
        ) : (
            <FaArrowRight className="text-white text-xl group-hover:scale-110 transition-transform" />
        )}
    </button>
);

const NavigationDots = ({ selectedIndex, totalItems, onSelect }: NavigationDotsProps) => (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 z-40 invisible md:visible">
        <button
            onClick={() => onSelect(-1)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
                selectedIndex === -1
                    ? "bg-white scale-110"
                    : "bg-white/50 hover:bg-white/70"
            }`}
            aria-label="View 3D model"
            type="button"
        />
        {Array.from({ length: totalItems }, (_, index) => (
            <button
                key={index}
                onClick={() => onSelect(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                    selectedIndex === index
                        ? "bg-white scale-110"
                        : "bg-white/50 hover:bg-white/70"
                }`}
                aria-label={`View image ${index + 1}`}
                type="button"
            />
        ))}
    </div>
);

const isIOS =
    typeof navigator !== "undefined" &&
    (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));
const isMobile =
    typeof window !== "undefined" && /Mobi|Android/i.test(navigator.userAgent);
const getTimeoutDuration = () => (isMobile ? 5000 : 3000);

export const ModelViewer = ({
    model,
    selectedRenderIndex,
    setSelectedRenderIndex,
}: ModelViewerProps) => {
    const [modelLoaded, setModelLoaded] = useState<boolean>(false);
    const [loadProgress, setLoadProgress] = useState<number>(0);
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
    const [customFullscreen, setCustomFullscreen] = useState<boolean>(false);
    const [autoRotate, setAutoRotate] = useState<boolean>(true);
    const [controlsVisible, setControlsVisible] = useState<boolean>(true);
    const [isHovering, setIsHovering] = useState<boolean>(false);
    const modelViewerRef = useRef<ModelViewerElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const autoHideTimerRef = useRef<NodeJS.Timeout | null>(null);

    const fallback3DUrl =
        typeof model.convertedFileUrl === "string" && model.convertedFileUrl.length > 0
            ? model.convertedFileUrl
            : typeof model.originalFileUrl === "string"
            ? model.originalFileUrl
            : "";
    const renderExtraUrls = Array.isArray(model.renderExtraUrls)
        ? model.renderExtraUrls
        : [];
    const posterUrl = typeof model.posterUrl === "string" ? model.posterUrl : undefined;

    //handlers
    const handleTouchStart = () => {
        setIsHovering(true);
        // Only set controls visible on touch if in fullscreen mode
        if (isFullscreen || (isIOS && customFullscreen)) {
            setControlsVisible(true);
            if (autoHideTimerRef.current) {
                clearTimeout(autoHideTimerRef.current);
            }
        }
    };

    const handleTouchEnd = () => {
        setIsHovering(false);
    };

    const toggleRotation = () => {
        const viewer = modelViewerRef.current;
        if (viewer) {
            setAutoRotate((prev) => !prev);
        }
    };

    const toggleMenu = () => {
        setControlsVisible((prev) => !prev);
    };

    const resetView = () => {
        const mainViewer = modelViewerRef.current;
        if (mainViewer) {
            mainViewer.cameraOrbit = "0deg 75deg 105%";
            mainViewer.fieldOfView = "50deg";
        }
    };

    const toggleFullscreen = () => {
        const container = containerRef.current;
        if (!container) return;

        if (isIOS) {
            // Use custom fullscreen for iOS
            setCustomFullscreen(!customFullscreen);
            setIsFullscreen(!customFullscreen);
            // Always show controls when not in fullscreen
            if (customFullscreen) {
                setControlsVisible(true);
            }
        } else {
            // Use native fullscreen for other devices
            if (!fullscreenConfig.isFullscreen()) {
                const result = fullscreenConfig.enter(container);
                if (result && typeof (result as Promise<void>).catch === "function") {
                    (result as Promise<void>).catch((err: unknown) => {
                        if (err instanceof Error) {
                            console.error(
                                `Error attempting to enable fullscreen: ${err.message}`
                            );
                        } else {
                            console.error(
                                "Unknown error attempting to enable fullscreen",
                                err
                            );
                        }
                    });
                }
            } else {
                const result = fullscreenConfig.exit();
                if (result && typeof (result as Promise<void>).catch === "function") {
                    (result as Promise<void>).catch((err: unknown) => {
                        if (err instanceof Error) {
                            console.error(
                                `Error attempting to exit fullscreen: ${err.message}`
                            );
                        } else {
                            console.error(
                                "Unknown error attempting to exit fullscreen",
                                err
                            );
                        }
                    });
                }
                // Always show controls when exiting fullscreen
                setControlsVisible(true);
            }
        }
    };

    const takeScreenshot = () => {
        const viewer = modelViewerRef.current;
        if (!viewer) return;

        try {
            viewer.toBlob({ idealAspect: true, mimeType: "image/png" }).then((blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${model.name || "model"}-screenshot.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            });
        } catch (error) {
            console.error("Error taking screenshot:", error);
        }
    };

    const handlePrevious = () => {
        if (selectedRenderIndex === -1) {
            setSelectedRenderIndex(renderExtraUrls.length - 1);
        } else if (selectedRenderIndex === 0) {
            setSelectedRenderIndex(-1);
        } else {
            setSelectedRenderIndex(selectedRenderIndex - 1);
        }
    };

    const handleNext = () => {
        if (selectedRenderIndex === -1) {
            setSelectedRenderIndex(0);
        } else if (selectedRenderIndex === renderExtraUrls.length - 1) {
            setSelectedRenderIndex(-1);
        } else {
            setSelectedRenderIndex(selectedRenderIndex + 1);
        }
    };

    // Effects
    useEffect(() => {
        const viewer = modelViewerRef.current;
        if (!viewer) return;

        const handleProgress = (event: Event) => {
            // Type guard for CustomEvent with detail
            if (
                "detail" in event &&
                typeof (event as CustomEvent<{ totalProgress: number }>).detail
                    ?.totalProgress === "number"
            ) {
                setLoadProgress(
                    (event as CustomEvent<{ totalProgress: number }>).detail.totalProgress
                );
            }
        };

        const handleLoad = () => {
            setModelLoaded(true);
        };

        viewer.addEventListener("progress", handleProgress);
        viewer.addEventListener("load", handleLoad);

        return () => {
            viewer.removeEventListener("progress", handleProgress);
            viewer.removeEventListener("load", handleLoad);
        };
    }, [fallback3DUrl]);

    useEffect(() => {
        const shouldAutoHide =
            (isFullscreen || (isIOS && customFullscreen)) &&
            controlsVisible &&
            (!isHovering || isMobile);

        if (shouldAutoHide) {
            autoHideTimerRef.current = setTimeout(() => {
                setControlsVisible(false);
            }, getTimeoutDuration());
        }

        return () => {
            if (autoHideTimerRef.current) {
                clearTimeout(autoHideTimerRef.current);
            }
        };
    }, [isFullscreen, customFullscreen, controlsVisible, isHovering]);

    useEffect(() => {
        const cleanup = fullscreenConfig.onChange(() => {
            setIsFullscreen(fullscreenConfig.isFullscreen());
            if (!fullscreenConfig.isFullscreen()) {
                setControlsVisible(true);
            }
        });

        return cleanup;
    }, []);

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            const container = containerRef.current;
            if (!container) return;

            switch (e.key) {
                case "r":
                    toggleRotation();
                    break;
                case "f":
                    e.preventDefault();
                    if (fullscreenConfig.isFullscreen()) {
                        fullscreenConfig.exit();
                    } else {
                        toggleFullscreen();
                    }
                    break;
                case "h":
                    resetView();
                    break;
                case "m":
                    toggleMenu();
                    break;
                default:
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyPress);
        return () => window.removeEventListener("keydown", handleKeyPress);
    }); // Remove empty dependency array to avoid stale closure issues

    useEffect(() => {
        if (isIOS && customFullscreen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [customFullscreen]);

    // Helper function for container classes
    const getContainerClasses = () => {
        const baseClasses =
            "relative w-full bg-gray-100 dark:bg-gray-800 overflow-hidden";
        const heightClasses =
            (isIOS && customFullscreen) || isFullscreen
                ? "h-screen"
                : "h-[40vh] lg:h-[calc(80vh-120px)]";
        const borderClasses =
            !customFullscreen && !isFullscreen
                ? "rounded-lg border border-gray-200 dark:border-gray-700"
                : "";
        return `${baseClasses} ${heightClasses} ${borderClasses}`;
    };

    const mainPreview =
        selectedRenderIndex === -1 ? (
            fallback3DUrl ? (
                <div className={getContainerClasses()}>
                    {/* @ts-expect-error - model-viewer is not a valid HTML element */}
                    <model-viewer
                        ref={modelViewerRef}
                        poster={posterUrl}
                        src={fallback3DUrl}
                        alt="3D Model"
                        camera-controls
                        interaction-prompt="none"
                        crossOrigin="anonymous"
                        environment-image="neutral"
                        auto-rotate={autoRotate}
                        className="w-full h-full"
                        style={{
                            backgroundColor: "#616161",
                            borderRadius:
                                (isIOS && customFullscreen) || isFullscreen
                                    ? "0"
                                    : "0.5rem",
                            "--poster-color": "transparent",
                        }}
                    />

                    {!modelLoaded && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-40">
                            <div className="bg-black/40 p-6 rounded-lg backdrop-blur-md">
                                <p className="text-lg text-white animate-pulse mb-3">
                                    Loading 3D model
                                </p>
                                <div className="w-52 h-2 bg-white/20 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-cyan-300 transition-all duration-300"
                                        style={{ width: `${loadProgress * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation Arrows and Dots */}
                    {renderExtraUrls.length > 0 && (
                        <div>
                            <NavigationArrow direction="left" onClick={handlePrevious} />
                            <NavigationArrow direction="right" onClick={handleNext} />
                            <NavigationDots
                                selectedIndex={selectedRenderIndex}
                                totalItems={renderExtraUrls.length}
                                onSelect={setSelectedRenderIndex}
                            />

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
                                onClick={controlsVisible ? undefined : toggleMenu}
                                onMouseEnter={() => setIsHovering(true)}
                                onMouseLeave={() => setIsHovering(false)}
                                onTouchStart={handleTouchStart}
                                onTouchEnd={handleTouchEnd}
                                role="button"
                                tabIndex={0}
                                aria-label="Toggle Menu (M)"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        toggleMenu();
                                    }
                                }}
                            >
                                <div className="bg-black/30 backdrop-blur-sm px-4 py-2 rounded-t-lg group hover:bg-black/40 transition-colors relative">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className={`h-6 w-6 text-white transform transition-transform duration-300 ${
                                            controlsVisible ? "rotate-180 opacity-50" : ""
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
                                onMouseEnter={() => setIsHovering(true)}
                                onMouseLeave={() => setIsHovering(false)}
                                onTouchStart={handleTouchStart}
                                onTouchEnd={handleTouchEnd}
                            >
                                <div className="flex items-center justify-center gap-4 backdrop-blur-sm px-4 md:py-3 sm:py-1 shadow-lg bg-black/30">
                                    <button
                                        onClick={toggleRotation}
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
                                        onClick={resetView}
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
                                        onClick={toggleFullscreen}
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
                                                d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z"
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
                                        onClick={takeScreenshot}
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

                            {!modelLoaded && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-40">
                                    <div className="bg-black/40 p-6 rounded-lg backdrop-blur-md">
                                        <p className="text-lg text-white animate-pulse mb-3">
                                            Loading 3D model
                                        </p>
                                        <div className="w-52 h-2 bg-white/20 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-cyan-300 transition-all duration-300"
                                                style={{
                                                    width: `${loadProgress * 100}%`,
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex items-center justify-center w-full h-[40vh] lg:h-[calc(80vh-120px)] bg-gray-200 rounded-md">
                    No 3D preview available
                </div>
            )
        ) : (
            <div
                className={`relative flex items-center justify-center ${
                    (isIOS && customFullscreen) || isFullscreen
                        ? "h-screen"
                        : "h-[40vh] lg:h-[calc(80vh-120px)]"
                }`}
            >
                {/* <img
                    src={renderExtraUrls[selectedRenderIndex]}
                    alt={`Render ${selectedRenderIndex + 1}`}
                    className="max-h-full max-w-full object-contain rounded-md shadow-lg"
                /> */}
                <LazyImage
                    wrapperClassName="w-full h-full"
                    src={renderExtraUrls[selectedRenderIndex]}
                    // Use the full-resolution render for the main preview. No thumbnail fallback.
                    sizes="(max-width: 1024px) 100vw, 80vw"
                    alt={`Render ${selectedRenderIndex + 1}`}
                    loading="lazy"
                    className="w-full h-full object-contain rounded-md shadow-lg"
                />

                {/* Navigation Controls */}
                {renderExtraUrls.length > 0 && (
                    <div className="invisible md:visible">
                        <NavigationArrow direction="left" onClick={handlePrevious} />
                        <NavigationArrow direction="right" onClick={handleNext} />
                        <NavigationDots
                            selectedIndex={selectedRenderIndex}
                            totalItems={renderExtraUrls.length}
                            onSelect={setSelectedRenderIndex}
                        />
                    </div>
                )}
            </div>
        );

    return (
        <div
            className={`flex-1 flex flex-col gap-4 ${
                isIOS && customFullscreen
                    ? "fixed inset-0 z-[9999] bg-gray-900 w-screen h-screen m-0 p-0"
                    : isFullscreen
                    ? "h-screen"
                    : ""
            }`}
            ref={containerRef}
        >
            <div className={getContainerClasses()}>{mainPreview}</div>
        </div>
    );
};
