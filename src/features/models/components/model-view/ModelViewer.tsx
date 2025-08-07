import { useState, useRef, useEffect } from "react";
import { fullscreenConfig } from "@/config/fullscreenConfig";
import { LazyImage } from "@/features/shared/reusable/LazyImage";
import { useModelLoader } from "@/features/models/hooks/useModelLoader";
//components
import { NavigationArrow, NavigationDots } from "./NavItems";
import { LoadModelButton } from "./LoadModelButton";
//utils
import { getContainerClasses } from "@/features/models/utils/getContainerClasses";
import { getDeviceType } from "@/features/models/utils/getDeviceType";
//types
import type { ModelViewerElement } from "@google/model-viewer";
import type { ModelViewerProps } from "@/features/models/types/modelViewer";

// device detection
const { isIOS, isMobile } = getDeviceType();
const getTimeoutDuration = () => (isMobile ? 5000 : 3000);

// Model Viewer Component
export const ModelViewer = ({
    model,
    selectedRenderIndex,
    setSelectedRenderIndex,
    threeImported = false,
}: ModelViewerProps) => {
    //Menu State
    const [autoRotate, setAutoRotate] = useState<boolean>(true);
    const [isHovering] = useState<boolean>(false);
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
    const [controlsVisible, setControlsVisible] = useState<boolean>(true);
    const [customFullscreen, setCustomFullscreen] = useState<boolean>(false);

    // Model State
    const [userRequestedModelLoad, setUserRequestedModelLoad] = useState<boolean>(false);

    //Refs
    const containerRef = useRef<HTMLDivElement | null>(null);
    const autoHideTimerRef = useRef<NodeJS.Timeout | null>(null);
    const modelViewerRef = useRef<ModelViewerElement | null>(null);

    //Model URLs
    const modelUrl = model.convertedFileUrl || "";
    const posterUrl = model.posterUrl || "";
    const renderExtraUrls = model.renderExtraUrls || [];

    // Global load state for this model URL

    const {
        status: modelGlobalStatus,
        progress: modelGlobalProgress,
        markLoading: markModelLoading,
        markLoaded: markModelLoaded,
        updateProgress: updateModelProgress,
        cancelLoading: cancelModelLoading,
        isCached: isModelCached,
    } = useModelLoader(modelUrl);

    // Use global status directly instead of local state to reduce re-renders
    const modelFileLoaded = modelGlobalStatus === "loaded";
    const modelLoadProgress = modelGlobalProgress;

    // Viewer Loading State
    const [modelViewerProgress, setModelViewerProgress] = useState(0);

    // Model Loading State
    // const [modelLoadProgress, setModelFileLoaded] = useState<boolean>(false);
    // const [modelLoadProgress, setModelLoadProgress] = useState<number>(0);

    // Log state changes
    useEffect(() => {
        console.log("📊 Model state update:", {
            modelGlobalStatus,
            modelGlobalProgress,
            modelFileLoaded,
            userRequestedModelLoad,
        });
    }, [modelGlobalStatus, modelGlobalProgress, modelFileLoaded, userRequestedModelLoad]);

    // Debug download progress changes
    useEffect(() => {
        console.log("🔄 Download progress changed:", modelGlobalProgress);
    }, [modelGlobalProgress]);

    // Debug model viewer progress changes
    useEffect(() => {
        console.log("🔄 Model Viewer Progress:", modelViewerProgress);
    }, [modelViewerProgress]);

    // Debug model load progress changes
    useEffect(() => {
        console.log("🔄 Model Load Progress:", modelLoadProgress);
    }, [modelLoadProgress]);

    // Debug model global progress changes
    useEffect(() => {
        console.log("🔄 Model Global Progress:", modelGlobalProgress);
    }, [modelGlobalProgress]);

    // Navigation Handlers
    // const handlePrevious = () => {
    //     setSelectedRenderIndex((prev: number) =>
    //         prev <= -1 ? renderExtraUrls.length - 1 : prev - 1
    //     );
    // };
    // const handleNext = () => {
    //     setSelectedRenderIndex((prev: number) =>
    //         prev >= renderExtraUrls.length - 1 ? -1 : prev + 1
    //     );
    // };

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
    /////////////////////////////////////////////         Menu Handlers         ///////////////////////////////////////////////////////

    // const handleTouchStart = () => {
    //     setIsHovering(true);
    //     // Only set menu visible on touch if in fullscreen mode
    //     if (isFullscreen || (isIOS && customFullscreen)) {
    //         setControlsVisible(true);
    //         if (autoHideTimerRef.current) {
    //             clearTimeout(autoHideTimerRef.current);
    //         }
    //     }
    // };
    // const handleTouchEnd = () => {
    //     setIsHovering(false);
    // };
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
    // const takeScreenshot = () => {
    //     const viewer = modelViewerRef.current;
    //     if (!viewer) return;

    //     try {
    //         viewer.toBlob({ idealAspect: true, mimeType: "image/png" }).then((blob) => {
    //             const url = URL.createObjectURL(blob);
    //             const a = document.createElement("a");
    //             a.href = url;
    //             a.download = `${model.name || "model"}-screenshot.png`;
    //             document.body.appendChild(a);
    //             a.click();
    //             document.body.removeChild(a);
    //             URL.revokeObjectURL(url);
    //         });
    //     } catch (error) {
    //         console.error("Error taking screenshot:", error);
    //     }
    // };
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
    /////////////////////////////////////////////         Menu Effects         ///////////////////////////////////////////////////////

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
    });
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
        if (isIOS && customFullscreen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [customFullscreen]);

    /////////////////////////////////////////////         Load Model Handlers       ///////////////////////////////////////////////////////

    // const handleLoadModel = () => {
    //     if (modelGlobalStatus === "loaded") {
    //         setUserRequestedModelLoad(true);
    //         setModelFileLoaded(true);
    //         return;
    //     }
    //     if (modelGlobalStatus === "idle") {
    //         markModelLoading();
    //     }
    //     setUserRequestedModelLoad(true);
    //     setModelFileLoaded(false);
    // };
    const handleLoadModel = () => {
        console.log("🚀 Load Model button clicked:", {
            currentStatus: modelGlobalStatus,
            isCached: isModelCached,
        });

        setUserRequestedModelLoad(true);
        if (modelGlobalStatus === "idle") {
            console.log("📥 Starting model loading...");
            markModelLoading();
        } else {
            console.log("⏭️ Model already in progress or loaded");
        }
    };

    // Handle navigation away - cancel loading if user navigates
    useEffect(() => {
        return () => {
            if (modelGlobalStatus === "loading") {
                cancelModelLoading();
            }
        };
    }, [modelGlobalStatus, cancelModelLoading]);

    // Model Load Handlers
    useEffect(() => {
        console.log("🔄 Model Load Effect:", {
            threeImported,
            userRequestedModelLoad,
            modelGlobalStatus,
            modelFileLoaded,
        });

        if (!threeImported || !userRequestedModelLoad) return;

        let currentProgress = 0;
        let cleanup: (() => void) | null = null;

        const timeout = setTimeout(() => {
            const viewer = modelViewerRef.current;
            if (!viewer) {
                console.log("❌ Model viewer element not found");
                return;
            }

            console.log("🎯 Setting up model viewer event listeners");

            const handleProgress = (e: Event) => {
                const event = e as CustomEvent<{ totalProgress: number }>;
                currentProgress = event.detail.totalProgress;
                setModelViewerProgress(currentProgress);
                // Log all progress updates to see the full flow
                console.log(
                    "📊 Model viewer progress:",
                    `${Math.round(currentProgress * 100)}%`
                );
                updateModelProgress(currentProgress);
            };

            const handleLoad = () => {
                console.log("✅ Model viewer load event fired");
                markModelLoaded();
                // Force a small delay to ensure the UI updates
                setTimeout(() => {
                    console.log("✅ Model loading complete - UI should hide");
                }, 100);
            };

            const handleError = () => {
                console.error("❌ Model viewer failed to load");
            };

            viewer.addEventListener("progress", handleProgress);
            viewer.addEventListener("load", handleLoad);
            viewer.addEventListener("error", handleError);

            cleanup = () => {
                console.log("🧹 Cleaning up model viewer listeners");
                if (currentProgress > 0 && currentProgress < 1) {
                    updateModelProgress(currentProgress);
                }
                viewer.removeEventListener("progress", handleProgress);
                viewer.removeEventListener("load", handleLoad);
                viewer.removeEventListener("error", handleError);
            };
        }, 50);

        return () => {
            console.log("🔄 Model Load Effect cleanup");
            clearTimeout(timeout);
            if (cleanup) cleanup();
        };
    }, [
        modelUrl,
        threeImported,
        userRequestedModelLoad,
        updateModelProgress,
        markModelLoaded,
    ]);

    // Reset model file loaded state when user requests model and Three.js is imported
    // useEffect(() => {
    //     if (threeImported && userRequestedModelLoad && modelGlobalStatus !== "loaded") {
    //         setModelFileLoaded(false);
    //     }
    // }, [threeImported, userRequestedModelLoad, modelGlobalStatus]);

    // const mainPreview =
    //     selectedRenderIndex === -1 ? (
    //         modelUrl ? (
    //             !userRequestedModelLoad ? (
    //                 // Show poster with Load Model button until user requests model
    //                 <div
    //                     className={getContainerClasses({
    //                         isIOS,
    //                         customFullscreen,
    //                         isFullscreen,
    //                     })}
    //                 >
    //                     <div
    //                         className="relative w-full h-full overflow-hidden"
    //                         style={{
    //                             backgroundColor: "#616161",
    //                         }}
    //                     >
    //                         {/* Initial poster image with load model button */}
    //                         {posterUrl && (
    //                             <img
    //                                 src={posterUrl}
    //                                 alt="3D Model Preview"
    //                                 className="absolute inset-0 w-full h-full object-contain"
    //                             />
    //                         )}

    //                         <LoadModelButton handleLoadModel={handleLoadModel} />
    //                     </div>
    //                 </div>
    //             ) : (
    //                 <div
    //                     className={getContainerClasses({
    //                         isIOS,
    //                         customFullscreen,
    //                         isFullscreen,
    //                     })}
    //                 >
    //                     {/* @ts-expect-error - model-viewer is not a valid HTML element */}
    //                     <model-viewer
    //                         ref={modelViewerRef}
    //                         poster={posterUrl}
    //                         src={modelUrl}
    //                         alt="3D Model"
    //                         camera-controls
    //                         interaction-prompt="none"
    //                         crossOrigin="anonymous"
    //                         environment-image="neutral"
    //                         auto-rotate={autoRotate}
    //                         className="w-full h-full"
    //                         style={{
    //                             backgroundColor: "#616161",
    //                             borderRadius:
    //                                 (isIOS && customFullscreen) || isFullscreen
    //                                     ? "0"
    //                                     : "0.5rem",
    //                             "--poster-color": "transparent",
    //                         }}
    //                     />

    //                     {!modelFileLoaded && (
    //                         <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 z-40">
    //                             {/* Debug info */}
    //                             <div className="absolute top-2 left-2 bg-black/80 text-white text-xs p-2 rounded">
    //                                 Debug: modelFileLoaded={modelFileLoaded.toString()},
    //                                 globalStatus={modelGlobalStatus}, progress=
    //                                 {Math.round(modelLoadProgress * 100)}%
    //                             </div>
    //                             <div className="bg-black/50 p-6 rounded-lg backdrop-blur-sm">
    //                                 <p className="text-lg text-white animate-pulse mb-3">
    //                                     {modelGlobalStatus === "idle" &&
    //                                     userRequestedModelLoad
    //                                         ? "Waiting in queue..."
    //                                         : "Loading 3D model"}
    //                                 </p>
    //                                 {modelGlobalStatus === "loading" && (
    //                                     <div className="w-52 h-2 bg-white/20 rounded-full overflow-hidden">
    //                                         <div
    //                                             className="h-full bg-cyan-300 transition-all duration-300"
    //                                             style={{
    //                                                 width: `${modelLoadProgress * 100}%`,
    //                                             }}
    //                                         />
    //                                     </div>
    //                                 )}
    //                                 {modelGlobalStatus === "idle" &&
    //                                     userRequestedModelLoad && (
    //                                         <div className="w-52 h-2 bg-white/20 rounded-full overflow-hidden">
    //                                             <div className="h-full bg-yellow-400 animate-pulse" />
    //                                         </div>
    //                                     )}
    //                             </div>
    //                         </div>
    //                     )}

    //                     {/* Navigation Controls for 3D Model */}
    //                     {renderExtraUrls.length > 0 && (
    //                         <div>
    //                             {/* Toggle Arrow */}
    //                             <div
    //                                 className={`${
    //                                     (isIOS && customFullscreen) || isFullscreen
    //                                         ? "fixed"
    //                                         : "absolute"
    //                                 } bottom-0 left-1/2 transform -translate-x-1/2 cursor-pointer z-[999] transition-transform duration-300 ${
    //                                     controlsVisible
    //                                         ? "translate-y-full pointer-events-none"
    //                                         : "translate-y-0"
    //                                 }`}
    //                                 onClick={controlsVisible ? undefined : toggleMenu}
    //                                 onMouseEnter={() => setIsHovering(true)}
    //                                 onMouseLeave={() => setIsHovering(false)}
    //                                 onTouchStart={handleTouchStart}
    //                                 onTouchEnd={handleTouchEnd}
    //                                 role="button"
    //                                 tabIndex={0}
    //                                 aria-label="Toggle Menu (M)"
    //                                 onKeyDown={(e) => {
    //                                     if (e.key === "Enter" || e.key === " ") {
    //                                         toggleMenu();
    //                                     }
    //                                 }}
    //                             >
    //                                 <div className="bg-black/30 backdrop-blur-sm px-4 py-2 rounded-t-lg group hover:bg-black/40 transition-colors relative">
    //                                     <svg
    //                                         xmlns="http://www.w3.org/2000/svg"
    //                                         className={`h-6 w-6 text-white transform transition-transform duration-300 ${
    //                                             controlsVisible
    //                                                 ? "rotate-180 opacity-50"
    //                                                 : ""
    //                                         }`}
    //                                         viewBox="0 0 20 20"
    //                                         fill="currentColor"
    //                                     >
    //                                         <path
    //                                             fillRule="evenodd"
    //                                             d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
    //                                             clipRule="evenodd"
    //                                         />
    //                                     </svg>
    //                                     <span
    //                                         role="tooltip"
    //                                         className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 text-xs bg-black/80 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none"
    //                                     >
    //                                         Toggle Menu (M)
    //                                     </span>
    //                                 </div>
    //                             </div>

    //                             {/* Controls Bar */}
    //                             <div
    //                                 className={`${
    //                                     (isIOS && customFullscreen) || isFullscreen
    //                                         ? "fixed"
    //                                         : "absolute"
    //                                 } bottom-0 left-0 right-0 transition-transform duration-300 ease-in-out transform z-[9999] ${
    //                                     controlsVisible
    //                                         ? "translate-y-0"
    //                                         : "translate-y-full pointer-events-none"
    //                                 }`}
    //                                 onMouseEnter={() => setIsHovering(true)}
    //                                 onMouseLeave={() => setIsHovering(false)}
    //                                 onTouchStart={handleTouchStart}
    //                                 onTouchEnd={handleTouchEnd}
    //                             >
    //                                 <div className="flex items-center justify-center gap-4 backdrop-blur-sm px-4 md:py-3 sm:py-1 shadow-lg bg-black/30">
    //                                     <button
    //                                         onClick={toggleRotation}
    //                                         disabled={!controlsVisible}
    //                                         aria-label="Rotate (R)"
    //                                         className={`p-2 rounded-full hover:bg-white/20 transition-colors group relative ${
    //                                             !controlsVisible ? "opacity-50" : ""
    //                                         }`}
    //                                     >
    //                                         <svg
    //                                             xmlns="http://www.w3.org/2000/svg"
    //                                             className={`h-6 w-6 text-white ${
    //                                                 autoRotate ? "animate-spin" : ""
    //                                             }`}
    //                                             viewBox="0 0 20 20"
    //                                             fill="currentColor"
    //                                         >
    //                                             <path
    //                                                 fillRule="evenodd"
    //                                                 d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
    //                                                 clipRule="evenodd"
    //                                             />
    //                                         </svg>
    //                                         <span
    //                                             role="tooltip"
    //                                             className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 text-xs bg-black/80 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none"
    //                                         >
    //                                             Rotate (R)
    //                                         </span>
    //                                     </button>

    //                                     <div className="w-px h-6 bg-white/20"></div>

    //                                     <button
    //                                         onClick={resetView}
    //                                         disabled={!controlsVisible}
    //                                         aria-label="Reset View (H)"
    //                                         className={`p-2 rounded-full hover:bg-white/20 transition-colors group relative ${
    //                                             !controlsVisible ? "opacity-50" : ""
    //                                         }`}
    //                                     >
    //                                         <svg
    //                                             xmlns="http://www.w3.org/2000/svg"
    //                                             className="h-6 w-6 text-white"
    //                                             viewBox="0 0 20 20"
    //                                             fill="currentColor"
    //                                         >
    //                                             <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
    //                                             <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" />
    //                                             <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" />
    //                                         </svg>
    //                                         <span
    //                                             role="tooltip"
    //                                             className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 text-xs bg-black/80 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none"
    //                                         >
    //                                             Reset View (H)
    //                                         </span>
    //                                     </button>

    //                                     <button
    //                                         onClick={toggleFullscreen}
    //                                         disabled={!controlsVisible}
    //                                         aria-label="Fullscreen (F)"
    //                                         className={`p-2 rounded-full hover:bg-white/20 transition-colors group relative ${
    //                                             !controlsVisible ? "opacity-50" : ""
    //                                         }`}
    //                                     >
    //                                         <svg
    //                                             xmlns="http://www.w3.org/2000/svg"
    //                                             className="h-6 w-6 text-white"
    //                                             viewBox="0 0 20 20"
    //                                             fill="currentColor"
    //                                         >
    //                                             <path
    //                                                 fillRule="evenodd"
    //                                                 d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z"
    //                                                 clipRule="evenodd"
    //                                             />
    //                                         </svg>
    //                                         <span
    //                                             role="tooltip"
    //                                             className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 text-xs bg-black/80 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none"
    //                                         >
    //                                             Fullscreen (F)
    //                                         </span>
    //                                     </button>

    //                                     <div className="w-px h-6 bg-white/20"></div>

    //                                     <button
    //                                         onClick={takeScreenshot}
    //                                         disabled={!controlsVisible}
    //                                         aria-label="Take Screenshot"
    //                                         className={`p-2 rounded-full hover:bg-white/20 transition-colors group relative ${
    //                                             !controlsVisible ? "opacity-50" : ""
    //                                         }`}
    //                                     >
    //                                         <svg
    //                                             xmlns="http://www.w3.org/2000/svg"
    //                                             className="h-6 w-6 text-white"
    //                                             viewBox="0 0 20 20"
    //                                             fill="currentColor"
    //                                         >
    //                                             <path
    //                                                 fillRule="evenodd"
    //                                                 d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z"
    //                                                 clipRule="evenodd"
    //                                             />
    //                                         </svg>
    //                                         <span
    //                                             role="tooltip"
    //                                             className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 text-xs bg-black/80 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none"
    //                                         >
    //                                             Screenshot
    //                                         </span>
    //                                     </button>
    //                                 </div>
    //                             </div>
    //                         </div>
    //                     )}
    //                 </div>
    //             )
    //         ) : (
    //             <div className="flex items-center justify-center w-full h-[40vh] lg:h-[calc(80vh-120px)] bg-gray-200 rounded-md">
    //                 No 3D preview available
    //             </div>
    //         )
    //     ) : (
    //         <div
    //             className={`relative flex items-center justify-center ${
    //                 (isIOS && customFullscreen) || isFullscreen
    //                     ? "h-screen"
    //                     : "h-[40vh] lg:h-[calc(80vh-120px)]"
    //             }`}
    //         >
    //             <LazyImage
    //                 wrapperClassName="w-full h-full"
    //                 src={renderExtraUrls[selectedRenderIndex]}
    //                 // Use the full-resolution render for the main preview. No thumbnail fallback.
    //                 sizes="(max-width: 1024px) 100vw, 80vw"
    //                 alt={`Render ${selectedRenderIndex + 1}`}
    //                 loading="lazy"
    //                 className="w-full h-full object-contain rounded-md shadow-lg"
    //             />
    //         </div>
    //     );

    const modelMainView =
        selectedRenderIndex === -1 ? (
            modelUrl ? (
                !userRequestedModelLoad ? (
                    <div
                        className={getContainerClasses({
                            isIOS,
                            customFullscreen,
                            isFullscreen,
                        })}
                    >
                        {posterUrl && (
                            <img
                                src={posterUrl}
                                alt="Preview"
                                className="absolute inset-0 w-full h-full object-contain"
                            />
                        )}
                        <LoadModelButton handleLoadModel={handleLoadModel} />
                    </div>
                ) : (
                    <div
                        className={getContainerClasses({
                            isIOS,
                            customFullscreen,
                            isFullscreen,
                        })}
                    >
                        {/* @ts-expect-error - model-viewer is not a valid HTML element */}
                        <model-viewer
                            ref={modelViewerRef}
                            poster={posterUrl}
                            src={modelUrl}
                            alt="3D Model"
                            camera-controls
                            interaction-prompt="none"
                            crossOrigin="anonymous"
                            environment-image="neutral"
                            auto-rotate={autoRotate}
                            className="w-full h-full"
                            style={{ backgroundColor: "#616161", borderRadius: "0.5rem" }}
                        />
                        {/* State Monitor - Always visible in top-left corner */}
                        <div className="absolute top-2 left-2 bg-black/80 text-white text-xs p-3 rounded-lg backdrop-blur-sm z-50 font-mono">
                            <div className="font-bold mb-1">State Monitor</div>
                            <div>
                                Status:{" "}
                                <span
                                    className={`${
                                        modelGlobalStatus === "loaded"
                                            ? "text-green-400"
                                            : modelGlobalStatus === "loading"
                                            ? "text-yellow-400"
                                            : "text-gray-400"
                                    }`}
                                >
                                    {modelGlobalStatus}
                                </span>
                            </div>
                            <div>
                                Download:{" "}
                                <span className="text-cyan-400">
                                    {Math.round(modelLoadProgress * 100)}%
                                </span>
                            </div>
                            <div>
                                Viewer:{" "}
                                <span className="text-blue-400">
                                    {Math.round(modelViewerProgress * 100)}%
                                </span>
                            </div>
                            <div>
                                Requested:{" "}
                                <span
                                    className={
                                        userRequestedModelLoad
                                            ? "text-green-400"
                                            : "text-red-400"
                                    }
                                >
                                    {userRequestedModelLoad ? "Yes" : "No"}
                                </span>
                            </div>
                            <div>
                                Cached:{" "}
                                <span
                                    className={
                                        isModelCached ? "text-green-400" : "text-gray-400"
                                    }
                                >
                                    {isModelCached ? "Yes" : "No"}
                                </span>
                            </div>
                            <div>
                                Three.js:{" "}
                                <span
                                    className={
                                        threeImported ? "text-green-400" : "text-red-400"
                                    }
                                >
                                    {threeImported ? "Loaded" : "Loading"}
                                </span>
                            </div>
                        </div>

                        {!modelFileLoaded && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 z-40">
                                <div className="bg-black/50 p-6 rounded-lg backdrop-blur-sm">
                                    <p className="text-lg text-white animate-pulse mb-3">
                                        {isModelCached
                                            ? "Loading cached model..."
                                            : modelGlobalStatus === "idle"
                                            ? "Starting download..."
                                            : "Processing 3D model"}
                                    </p>
                                    <div className="w-52 h-2 bg-white/20 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-cyan-300 transition-all duration-300"
                                            style={{
                                                width: `${
                                                    modelLoadProgress >= 1
                                                        ? (modelViewerProgress * 0.5 + 0.5) * 100
                                                        : modelLoadProgress * 100
                                                }%`,
                                            }}
                                        />
                                    </div>
                                    {isModelCached && (
                                        <p className="text-sm text-cyan-300 mt-2">
                                            Cached model - instant loading
                                        </p>
                                    )}
                                    {/* Debug info */}
                                    <div className="text-xs text-gray-300 mt-2">
                                        Status: {modelGlobalStatus} | Viewer:{" "}
                                        {Math.round(modelViewerProgress * 100)}% |
                                        Download: {Math.round(modelLoadProgress * 100)}% |
                                        Total:{" "}
                                        {Math.round(
                                            modelLoadProgress >= 1
                                                ? (modelLoadProgress * 0.5 + 0.5) * 100
                                                : modelViewerProgress * 100
                                        )}
                                        %
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )
            ) : (
                <div className="flex items-center justify-center w-full h-[40vh] bg-gray-200 rounded-md">
                    No 3D preview available
                </div>
            )
        ) : (
            <LazyImage
                wrapperClassName="w-full h-full"
                src={renderExtraUrls[selectedRenderIndex]}
                sizes="(max-width: 1024px) 100vw, 80vw"
                alt={`Render ${selectedRenderIndex + 1}`}
                loading="lazy"
                className="w-full h-full object-contain rounded-md shadow-lg"
            />
        );

    return (
        // <div
        //     className={`flex-1 flex flex-col gap-4 ${
        //         isIOS && customFullscreen
        //             ? "fixed inset-0 z-[9999] bg-gray-900 w-screen h-screen m-0 p-0"
        //             : isFullscreen
        //             ? "h-screen"
        //             : ""
        //     }`}
        //     ref={containerRef}
        // >
        //     <div
        //         className={getContainerClasses({ isIOS, customFullscreen, isFullscreen })}
        //     >
        //         {mainPreview}

        //         {/* Global Navigation Arrows - Always visible when there are multiple views */}
        //         {renderExtraUrls.length > 0 && (
        //             <>
        //                 <NavigationArrow direction="left" onClick={handlePrevious} />
        //                 <NavigationArrow direction="right" onClick={handleNext} />
        //                 <NavigationDots
        //                     selectedIndex={selectedRenderIndex}
        //                     totalItems={renderExtraUrls.length}
        //                     onSelect={setSelectedRenderIndex}
        //                 />
        //             </>
        //         )}
        //     </div>
        // </div>
        <div
            className={`flex-1 flex flex-col ${
                isIOS && customFullscreen
                    ? "fixed inset-0 z-[9999] bg-gray-900 w-screen h-screen"
                    : isFullscreen
                    ? "h-screen"
                    : ""
            }`}
            ref={containerRef}
        >
            <div
                className={getContainerClasses({ isIOS, customFullscreen, isFullscreen })}
            >
                {modelMainView}
                {renderExtraUrls.length > 0 && (
                    <>
                        <NavigationArrow direction="left" onClick={handlePrevious} />

                        <NavigationArrow direction="right" onClick={handleNext} />

                        <NavigationDots
                            selectedIndex={selectedRenderIndex}
                            totalItems={renderExtraUrls.length}
                            onSelect={setSelectedRenderIndex}
                        />
                    </>
                )}
            </div>
        </div>
    );
};
