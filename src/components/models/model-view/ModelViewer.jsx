import { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { LazyImage } from "../../shared/lazy-image/LazyImage";
import { ModelControls } from "./ModelControls";

export const ModelViewer = ({ model, selectedRenderIndex, setSelectedRenderIndex }) => {
    const [modelLoaded, setModelLoaded] = useState(false);
    const [loadProgress, setLoadProgress] = useState(0);
    const [yOffset, setYOffset] = useState(0);
    const [shadowIntensity, setShadowIntensity] = useState(0.5);
    const [exposure, setExposure] = useState(1.0);
    const modelViewerRef = useRef(null);

    const fallback3DUrl = model?.convertedFileUrl || model?.originalFileUrl || "";
    const renderFileUrls = model?.renderFileUrls || [];
    const posterUrl = model?.posterUrl;

    // Attach model-viewer event listeners
    useEffect(() => {
        const viewer = modelViewerRef.current;
        if (!viewer) return;

        const handleProgress = (event) => {
            setLoadProgress(event.detail.totalProgress);
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
        const viewer = modelViewerRef.current;
        if (!viewer || !viewer.model || !viewer.model.scene) return;

        viewer.model.scene.position.y = yOffset;
        viewer.requestRender?.();
    }, [yOffset, modelLoaded]);

    const mainPreview =
        selectedRenderIndex === -1 ? (
            fallback3DUrl ? (
                <div className="relative w-full h-[40vh] lg:h-[calc(80vh-120px)]">
                    <model-viewer
                        ref={modelViewerRef}
                        poster={posterUrl}
                        src={fallback3DUrl}
                        alt="3D Model"
                        camera-controls
                        interaction-prompt="none"
                        crossOrigin="anonymous"
                        environment-image="neutral"
                        shadow-intensity={shadowIntensity}
                        exposure={exposure}
                        className="w-full h-full"
                        style={{
                            backgroundColor: "#616161",
                            borderRadius: "0.5rem",
                            "--poster-color": "transparent",
                        }}
                        auto-rotate
                        camera-orbit="0deg 75deg 105%"
                        min-camera-orbit="auto auto 50%"
                        max-camera-orbit="auto auto 200%"
                    ></model-viewer>

                    {!modelLoaded && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-10">
                            <div className="bg-black/40 p-6 rounded-lg backdrop-blur-md">
                                <p className="text-lg text-white animate-pulse mb-3">
                                    Loading 3D model
                                </p>
                                <div className="w-52 h-2 bg-white/20 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-cyan-300 transition-all duration-300"
                                        style={{ width: `${loadProgress * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex items-center justify-center w-full h-[40vh] lg:h-[calc(80vh-120px)] bg-gray-200 rounded-md">
                    No 3D preview available
                </div>
            )
        ) : (
            <LazyImage
                src={renderFileUrls[selectedRenderIndex]}
                alt={`Render ${selectedRenderIndex + 1}`}
                loading="lazy"
                className="w-full h-[40vh] lg:h-[calc(80vh-120px)] object-contain rounded-md shadow-lg"
            />
        );

    return (
        <div className="flex-1 flex flex-col gap-4">
            {/* Main Preview */}
            <div className="relative w-full h-[40vh] lg:h-[calc(80vh-120px)] bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                {mainPreview}
            </div>

            {/* Thumbnails Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 space-y-4 lg:space-y-6 border border-gray-200 dark:border-gray-700">
                <div className="flex space-x-4 overflow-x-auto pb-2 -mx-2 px-2">
                    <div
                        onClick={() => setSelectedRenderIndex(-1)}
                        className={`flex-shrink-0 w-16 h-16 lg:w-20 lg:h-20 border-2 rounded-lg cursor-pointer overflow-hidden bg-gray-100 dark:bg-gray-800 ${
                            selectedRenderIndex === -1
                                ? "border-fuchsia-600 shadow-lg ring-2 ring-fuchsia-500/50"
                                : "border-gray-200 dark:border-gray-700 hover:border-fuchsia-500 hover:shadow-md"
                        }`}
                    >
                        {fallback3DUrl ? (
                            <model-viewer
                                ref={modelViewerRef}
                                poster={posterUrl}
                                src={fallback3DUrl}
                                alt="3D Model"
                                camera-controls
                                loading="lazy"
                                interaction-prompt="none"
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    backgroundColor: "#616161",
                                }}
                                environment-image="neutral"
                                className="object-cover"
                            ></model-viewer>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-xs">
                                3D
                            </div>
                        )}
                    </div>

                    {renderFileUrls.map((url, idx) => (
                        <div
                            key={idx}
                            onClick={() => setSelectedRenderIndex(idx)}
                            className={`flex-shrink-0 w-16 h-16 lg:w-20 lg:h-20 border-2 rounded-lg cursor-pointer overflow-hidden bg-gray-100 dark:bg-gray-800 ${
                                selectedRenderIndex === idx
                                    ? "border-fuchsia-600 shadow-lg ring-2 ring-fuchsia-500/50"
                                    : "border-gray-200 dark:border-gray-700 hover:border-fuchsia-500 hover:shadow-md"
                            }`}
                        >
                            <LazyImage
                                src={url}
                                alt={`Render ${idx + 1}`}
                                loading="lazy"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Model Controls */}
            <ModelControls
                offset={yOffset}
                exposure={exposure}
                shadowIntensity={shadowIntensity}
                setOffset={setYOffset}
                setExposure={setExposure}
                setShadowIntensity={setShadowIntensity}
            />
        </div>
    );
};

ModelViewer.propTypes = {
    model: PropTypes.shape({
        convertedFileUrl: PropTypes.string,
        originalFileUrl: PropTypes.string,
        renderFileUrls: PropTypes.arrayOf(PropTypes.string),
        posterUrl: PropTypes.string,
    }).isRequired,
    selectedRenderIndex: PropTypes.number.isRequired,
    setSelectedRenderIndex: PropTypes.func.isRequired,
};
