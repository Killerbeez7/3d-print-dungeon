import { lazy, Suspense, useCallback, useState, useRef, useEffect } from "react";
import { fullscreenConfig } from "@/config/fullscreenConfig";
// import { LazyImage } from "@/features/shared/reusable/LazyImage";
import { useModelLoader } from "@/features/models/hooks/useModelLoader";
//components
import { NavigationArrow, NavigationDots, ModelControls } from "./controls";
import { LoadModelButton, LoadingOverlay } from "./loading";
import type { ViewerLoadPhase } from "./loading/LoadingOverlay";
//utils
import { getContainerClasses } from "@/features/models/utils/getContainerClasses";
import { getResponsiveThumbnails } from "@/utils/imageUtils";
import { getDeviceType } from "@/features/models/utils/getDeviceType";
//types
import type { ModelViewerProps } from "@/features/models/types/modelViewer";
import type { MeshPreviewHandle } from "@/features/models/preview3d/MeshPreview";

// three.js and the viewer load only when someone reaches for the 3D view (see ModelPage).
const PreviewMeshViewer = lazy(() => import("@/features/models/preview3d/PreviewMeshViewer"));

// device detection
const { isIOS, isMobile } = getDeviceType();
const getTimeoutDuration = () => (isMobile ? 5000 : 3000);

// Model Viewer Component
export const ModelViewer = ({
    model,
    selectedRenderIndex,
    setSelectedRenderIndex,
}: ModelViewerProps) => {
    //Menu State
    const [autoRotate, setAutoRotate] = useState<boolean>(true);
    const [isHovering, setIsHovering] = useState<boolean>(false);
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
    const [controlsVisible, setControlsVisible] = useState<boolean>(true);
    const [customFullscreen, setCustomFullscreen] = useState<boolean>(false);

    // Model State
    const [isLoadButtonClicked, setIsLoadButtonClicked] = useState<boolean>(false);

    // Bumped on retry, so the viewer starts over.
    const [attempt, setAttempt] = useState(0);

    //Refs
    const containerRef = useRef<HTMLDivElement | null>(null);
    const autoHideTimerRef = useRef<NodeJS.Timeout | null>(null);
    const viewerHandleRef = useRef<MeshPreviewHandle | null>(null);

    //Model URLs
    const modelUrl = model.convertedFileUrl || "";
    const posterUrl = model.posterUrl || "";
    const renderExtraUrls = model.renderExtraUrls || [];

    // Global load state for this model URL

    const {
        status: modelGlobalStatus,
        progress: modelGlobalProgress,
        totalBytes: modelTotalBytes,
        markLoading: markModelLoading,
        cancelLoading: cancelModelLoading,
        getBytes: getModelBytes,
        forget: forgetModel,
    } = useModelLoader(modelUrl);

    // The viewer has drawn the model / couldn't open the file.
    const [viewerReady, setViewerReady] = useState(false);
    const [viewerFailed, setViewerFailed] = useState(false);

    // Use global status directly instead of local state to reduce re-renders
    const modelFileLoaded = modelGlobalStatus === "loaded";
    const modelLoadProgress = modelGlobalProgress;

    useEffect(() => {
        setViewerReady(false);
        setViewerFailed(false);
    }, [modelUrl]);

    //////////////////////////////////////////////      Navigation Handlers    ///////////////////////////////////////////////////////
    const handlePrevious = () => {
        const newIndex =
            selectedRenderIndex <= -1
                ? renderExtraUrls.length - 1
                : selectedRenderIndex - 1;
        setSelectedRenderIndex(newIndex);
    };
    const handleNext = () => {
        const newIndex =
            selectedRenderIndex >= renderExtraUrls.length - 1
                ? -1
                : selectedRenderIndex + 1;
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
        setAutoRotate((prev) => !prev);
    };
    const toggleMenu = () => {
        setControlsVisible((prev) => !prev);
    };
    const resetView = () => {
        viewerHandleRef.current?.resetView();
    };
    const takeScreenshot = () => {
        const viewer = viewerHandleRef.current;
        if (!viewer) return;

        try {
            viewer.screenshot().then((blob) => {
                if (!blob) return;
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

    // Retry after a failed download or a file the viewer couldn't open.
    const retryLoad = () => {
        setViewerFailed(false);
        setViewerReady(false);
        setAttempt((n) => n + 1);
        forgetModel();
        markModelLoading();
    };

    // Ready once the viewer has drawn the model, not just when the file arrived.
    const handleViewerReady = useCallback(() => setViewerReady(true), []);
    const handleViewerError = useCallback(() => setViewerFailed(true), []);

    const loadPhase: ViewerLoadPhase =
        viewerFailed || modelGlobalStatus === "error"
            ? "error"
            : viewerReady
              ? "ready"
              : modelGlobalStatus === "loaded"
                ? "prepare"
                : "download";

    const modelMainView =
        selectedRenderIndex === -1 ? (
            modelUrl ? (
                !isLoadButtonClicked ? (
                    <>
                        {posterUrl && (
                            <img
                                src={posterUrl}
                                alt=""
                                className="absolute inset-0 w-full h-full object-contain"
                                style={{
                                    filter: "blur(2px)",
                                }}
                                onError={(event) => {
                                    event.currentTarget.style.display = "none";
                                }}
                            />
                        )}
                        <LoadModelButton handleLoadModel={handleLoadModel} />
                    </>
                ) : (
                    <>
                        {(modelGlobalStatus === "loading" || modelFileLoaded) && (
                            <Suspense fallback={null}>
                                {/* Starts with the light level while the rest downloads; the
                                    preview is scrambled and unscrambled on the graphics card. */}
                                <PreviewMeshViewer
                                    key={`${modelUrl}-${attempt}`}
                                    getBytes={getModelBytes}
                                    complete={modelFileLoaded}
                                    progress={modelLoadProgress}
                                    autoRotate={autoRotate}
                                    handleRef={viewerHandleRef}
                                    onReady={handleViewerReady}
                                    onError={handleViewerError}
                                    className="absolute inset-0 h-full w-full rounded-lg"
                                />
                            </Suspense>
                        )}

                        {viewerReady && modelGlobalStatus === "loading" && (
                            <span
                                role="status"
                                className="label-mono pointer-events-none absolute left-3 top-3 z-10 rounded bg-surface-card/85 px-2 py-1 text-txt-secondary"
                            >
                                Full detail · {Math.round(modelLoadProgress * 100)}%
                            </span>
                        )}

                        <LoadingOverlay
                            phase={loadPhase}
                            progress={modelLoadProgress}
                            totalBytes={modelTotalBytes}
                            onRetry={retryLoad}
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
                    </>
                )
            ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-txt-muted">
                    No 3D preview available
                </div>
            )
        ) : (
            (() => {
                const original = renderExtraUrls[selectedRenderIndex];
                const responsive = getResponsiveThumbnails(original);
                const src = responsive.large || responsive.medium || original;
                const srcSet = [
                    responsive.small ? `${responsive.small} 320w` : null,
                    responsive.medium ? `${responsive.medium} 640w` : null,
                    responsive.large ? `${responsive.large} 1024w` : null,
                    responsive.xlarge ? `${responsive.xlarge} 1600w` : null,
                ]
                    .filter(Boolean)
                    .join(", ");
                return (
                    <img
                        src={src || original}
                        srcSet={srcSet || undefined}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 80vw"
                        alt={`Render ${selectedRenderIndex + 1}`}
                        loading="eager"
                        fetchPriority="high"
                        decoding="async"
                        className="absolute inset-0 w-full h-full object-contain rounded-md shadow-lg"
                        draggable={false}
                    />
                );
            })()
        );

    return (
        <div
            className={`flex flex-col ${
                isIOS && customFullscreen
                    ? "fixed inset-0 z-[9999] bg-page w-screen h-screen"
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
