import { useState, useRef, useEffect, useCallback } from "react";
import { fullscreenConfig } from "@/config/fullscreenConfig";
import { LazyImage } from "@/features/shared/reusable/LazyImage";
import { useModelLoader } from "@/features/models/hooks/useModelLoader";
//components
import { NavigationArrow, NavigationDots, ModelControls } from "./controls";
import { LoadModelButton, LoadingOverlay } from "./loading";
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
    const [isHovering, setIsHovering] = useState<boolean>(false);
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
    const [controlsVisible, setControlsVisible] = useState<boolean>(true);
    const [customFullscreen, setCustomFullscreen] = useState<boolean>(false);

    // Model State
    const [isLoadButtonClicked, setIsLoadButtonClicked] = useState<boolean>(false);

    // Object URL for loaded model blob
    const [modelBlobUrl, setModelBlobUrl] = useState<string | null>(null);

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
        getBlob: getModelBlob,
        isCached: isModelCached,
    } = useModelLoader(modelUrl);

    // Use global status directly instead of local state to reduce re-renders
    const modelFileLoaded = modelGlobalStatus === "loaded";
    const modelLoadProgress = modelGlobalProgress;

    // Create / revoke object URL when model blob becomes available
    const blobUrlCreatedRef = useRef(false);

    useEffect(() => {
        if (modelFileLoaded && !blobUrlCreatedRef.current) {
            const blob = getModelBlob();
            if (blob) {
                setModelBlobUrl((prev) => {
                    if (prev) URL.revokeObjectURL(prev);
                    return URL.createObjectURL(blob);
                });
                blobUrlCreatedRef.current = true;
                console.log("🔄 Model viewer: recieved the model");
            }
        }
    }, [modelFileLoaded, getModelBlob]);

    // Reset blob URL ref when model URL changes
    useEffect(() => {
        blobUrlCreatedRef.current = false;
    }, [modelUrl]);

    //////////////////////////////////////////////      Navigation Handlers    ///////////////////////////////////////////////////////
    const handlePrevious = () => {
        const newIndex = selectedRenderIndex <= -1 ? renderExtraUrls.length - 1 : selectedRenderIndex - 1;
        setSelectedRenderIndex(newIndex);
    };
    const handleNext = () => {
        const newIndex = selectedRenderIndex >= renderExtraUrls.length - 1 ? -1 : selectedRenderIndex + 1;
        setSelectedRenderIndex(newIndex);
    };
    //////////////////////////////////////////////      Menu Handlers         ///////////////////////////////////////////////////////
    const handleTouchStart = () => {
        setIsHovering(true);
        // Only set menu visible on touch if in fullscreen mode
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
    const handleLoadModel = () => {
        console.log("🚀 Load Model button clicked:", {
            currentStatus: modelGlobalStatus,
            isCached: isModelCached,
        });

        setIsLoadButtonClicked(true);

        // Otherwise initiate download if idle
        if (modelGlobalStatus === "idle") {
            markModelLoading();
        }
    };

    // Handle navigation away - cancel loading if user navigates
    useEffect(() => {
        return () => {
                cancelModelLoading();
        };
    }, [cancelModelLoading]);

    // Cleanup object URL on unmount
    const blobUrlRef = useRef<string | null>(null);
    blobUrlRef.current = modelBlobUrl;

    useEffect(() => {
        return () => {
            if (blobUrlRef.current) {
                URL.revokeObjectURL(blobUrlRef.current);
            }
        };
    }, []);

    // Model Load Handlers
    const listenersAttachedRef = useRef(false);

    const handleProgress = useCallback(
        (e: Event) => {
            const event = e as CustomEvent<{ totalProgress: number }>;
            const currentProgress = event.detail.totalProgress;

            updateModelProgress(currentProgress);
        },
        [updateModelProgress]
    );

    const handleLoad = useCallback(() => {
        console.log("✅ Model viewer: loaded the model");
        markModelLoaded();
    }, [markModelLoaded]);

    const handleError = useCallback(() => {
        console.error("❌ Model viewer failed to load");
    }, []);

    useEffect(() => {
        if (!threeImported || !isLoadButtonClicked || listenersAttachedRef.current)
            return;

        console.log("🎯 Setting up model viewer event listeners");
        listenersAttachedRef.current = true;

        const timeout = setTimeout(() => {
            const viewer = modelViewerRef.current;
            if (!viewer) {
                console.log("❌ Model viewer element not found");
                return;
            }

            viewer.addEventListener("progress", handleProgress);
            viewer.addEventListener("load", handleLoad);
            viewer.addEventListener("error", handleError);
        }, 50);

        return () => {
            clearTimeout(timeout);
            listenersAttachedRef.current = false;
        };
    }, [threeImported, isLoadButtonClicked, handleProgress, handleLoad, handleError]);

    const modelMainView =
        selectedRenderIndex === -1 ? (
            modelUrl ? (
                !isLoadButtonClicked ? (
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
                            src={modelBlobUrl ?? ""}
                            alt="3D Model"
                            camera-controls
                            interaction-prompt="none"
                            crossOrigin="anonymous"
                            environment-image="neutral"
                            auto-rotate={autoRotate}
                            className="w-full h-full"
                            style={{ backgroundColor: "#616161", borderRadius: "0.5rem" }}
                        />

                        <LoadingOverlay
                            isVisible={!modelFileLoaded}
                            isDownloading={modelGlobalStatus === "loading"}
                            downloadProgress={modelLoadProgress}
                        />

                        <ModelControls
                            controlsVisible={controlsVisible}
                            autoRotate={autoRotate}
                            isIOS={isIOS}
                            customFullscreen={customFullscreen}
                            isFullscreen={isFullscreen}
                            renderExtraUrls={renderExtraUrls}
                            onToggleMenu={toggleMenu}
                            onToggleRotation={toggleRotation}
                            onResetView={resetView}
                            onToggleFullscreen={toggleFullscreen}
                            onTakeScreenshot={takeScreenshot}
                            onTouchStart={handleTouchStart}
                            onTouchEnd={handleTouchEnd}
                            onMouseEnter={() => setIsHovering(true)}
                            onMouseLeave={() => setIsHovering(false)}
                        />
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
        <div
            className={`flex flex-col ${
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
