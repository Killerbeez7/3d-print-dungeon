import { useParams, Link } from "react-router-dom";
import { useModels } from "../../../contexts/modelsContext";
import { useAuth } from "../../../contexts/authContext";
import { Comments } from "./Comments";
import { CommentsProvider } from "../../../contexts/CommentsContext";
import { useState, useEffect, useRef } from "react";
import { LazyImage } from "../../shared/lazy-image/LazyImage";
import { LikeButton } from "../action-buttons/likeButton";
import { FavoritesButton } from "../action-buttons/favoritesButton";
import { useViewTracker } from "../../../services/viewService";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../../config/firebase";
import PropTypes from "prop-types";

export const ModelView = ({ openAuthModal }) => {
    const [shadowIntensity, setShadowIntensity] = useState(0.5);
    const [exposure, setExposure] = useState(1.0);
    const [modelLoaded, setModelLoaded] = useState(false);
    const [loadProgress, setLoadProgress] = useState(0);
    const [viewCount, setViewCount] = useState(0);

    const [yOffset, setYOffset] = useState(0);

    useEffect(() => {
        const viewer = modelViewerRef.current;
        if (!viewer || !viewer.model || !viewer.model.scene) return;

        viewer.model.scene.position.y = yOffset;
        viewer.requestRender?.();
    }, [yOffset, modelLoaded]);

    const modelViewerRef = useRef(null);

    const { id } = useParams();
    const {
        models,
        loading,
        uploader,
        selectedRenderIndex,
        setSelectedRenderIndex,
        fetchUploader,
    } = useModels();
    const { currentUser } = useAuth();
    
    // Use the hook directly - it will handle the view tracking internally
    useViewTracker(id);

    // Listen to view count changes in real-time
    useEffect(() => {
        if (!id) return;

        const modelRef = doc(db, 'models', id);
        const unsubscribe = onSnapshot(modelRef, (doc) => {
            if (doc.exists()) {
                setViewCount(doc.data().views || 0); // Changed viewCount to views to match the field name
            }
        });

        return () => unsubscribe();
    }, [id]);

    useEffect(() => {
        const model = models.find((m) => m.id === id);
        if (model && model.uploaderId) {
            fetchUploader(model.uploaderId);
        }
    }, [id, models, fetchUploader]);

    const model = models.find((m) => m.id === id);

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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-xl text-txt-primary">
                Loading model...
            </div>
        );
    }

    if (!model) {
        return (
            <div className="min-h-screen flex items-center justify-center text-xl text-txt-primary">
                Model not found!
            </div>
        );
    }

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
        <div className="bg-bg-primary text-txt-primary min-h-screen flex flex-col lg:flex-row gap-4 p-4 lg:p-6">
            {/* Left Side - Model Viewer */}
            <div className="flex-1 flex flex-col gap-4">
                {/* Main Preview */}
                <div className="relative w-full h-[40vh] lg:h-[calc(80vh-120px)] bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                    {mainPreview}
                </div>

                {/* Controls Section - Collapsible on Mobile */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 space-y-4 lg:space-y-6 border border-gray-200 dark:border-gray-700">
                    {/* Thumbnails at the top on mobile */}
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
                                    src={fallback3DUrl}
                                    alt="3D thumb"
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

                    {/* Model Controls - Collapsible on Mobile */}
                    <details className="group lg:hidden">
                        <summary className="list-none flex justify-between items-center cursor-pointer py-2 font-medium">
                            Model Controls
                            <svg
                                className="w-5 h-5 transform transition-transform group-open:rotate-180"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </summary>
                        <div className="pt-4 space-y-4">
                            {/* Y Offset Control */}
                            <div>
                                <label
                                    htmlFor="yOffsetSlider"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Model Y Offset
                                </label>
                                <input
                                    id="yOffsetSlider"
                                    type="range"
                                    min="-1"
                                    max="1"
                                    step="0.01"
                                    value={yOffset}
                                    onChange={(e) =>
                                        setYOffset(parseFloat(e.target.value))
                                    }
                                    className="w-full accent-fuchsia-600"
                                />
                                <p className="text-sm text-gray-600 mt-1">
                                    Current offset: {yOffset}
                                </p>
                            </div>

                            {/* Shadow Intensity Control */}
                            <div>
                                <label
                                    htmlFor="shadowSlider"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Shadow Intensity
                                </label>
                                <input
                                    id="shadowSlider"
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={shadowIntensity}
                                    onChange={(e) =>
                                        setShadowIntensity(parseFloat(e.target.value))
                                    }
                                    className="w-full accent-fuchsia-600"
                                />
                                <p className="text-sm text-gray-600 mt-1">
                                    Current intensity: {shadowIntensity}
                                </p>
                            </div>

                            {/* Exposure Control */}
                            <div>
                                <label
                                    htmlFor="exposureSlider"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Exposure
                                </label>
                                <input
                                    id="exposureSlider"
                                    type="range"
                                    min="0"
                                    max="2"
                                    step="0.1"
                                    value={exposure}
                                    onChange={(e) =>
                                        setExposure(parseFloat(e.target.value))
                                    }
                                    className="w-full accent-fuchsia-600"
                                />
                                <p className="text-sm text-gray-600 mt-1">
                                    Current exposure: {exposure}
                                </p>
                            </div>
                        </div>
                    </details>

                    {/* Desktop Controls */}
                    <div className="hidden lg:block space-y-6">
                        {/* Y Offset Control */}
                        <div>
                            <label
                                htmlFor="yOffsetSlider"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Model Y Offset
                            </label>
                            <input
                                id="yOffsetSlider"
                                type="range"
                                min="-1"
                                max="1"
                                step="0.01"
                                value={yOffset}
                                onChange={(e) => setYOffset(parseFloat(e.target.value))}
                                className="w-full accent-fuchsia-600"
                            />
                            <p className="text-sm text-gray-600 mt-1">
                                Current offset: {yOffset}
                            </p>
                        </div>

                        {/* Shadow Intensity Control */}
                        <div>
                            <label
                                htmlFor="shadowSlider"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Shadow Intensity
                            </label>
                            <input
                                id="shadowSlider"
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={shadowIntensity}
                                onChange={(e) =>
                                    setShadowIntensity(parseFloat(e.target.value))
                                }
                                className="w-full accent-fuchsia-600"
                            />
                            <p className="text-sm text-gray-600 mt-1">
                                Current intensity: {shadowIntensity}
                            </p>
                        </div>

                        {/* Exposure Control */}
                        <div>
                            <label
                                htmlFor="exposureSlider"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Exposure
                            </label>
                            <input
                                id="exposureSlider"
                                type="range"
                                min="0"
                                max="2"
                                step="0.1"
                                value={exposure}
                                onChange={(e) => setExposure(parseFloat(e.target.value))}
                                className="w-full accent-fuchsia-600"
                            />
                            <p className="text-sm text-gray-600 mt-1">
                                Current exposure: {exposure}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Info Panel */}
            <aside className="w-full lg:w-96 bg-white dark:bg-gray-800 p-4 lg:p-8 rounded-lg shadow-xl space-y-6">
                {/* Artist Info */}
                {uploader && (
                    <div className="flex items-center space-x-4 border-b pb-4">
                        <img
                            src={uploader.photoURL || "/default-avatar.png"}
                            alt={uploader.displayName || "Unknown User"}
                            className="w-12 h-12 lg:w-16 lg:h-16 rounded-full object-cover"
                        />
                        <div>
                            <h2 className="text-lg font-bold text-txt-primary">
                                {uploader.displayName || "Anonymous"}
                            </h2>
                            <p className="text-sm text-txt-secondary">
                                {viewCount} views
                            </p>
                        </div>
                    </div>
                )}

                {/* Model Info */}
                <div>
                    <h1 className="text-xl lg:text-2xl font-bold text-txt-primary mb-2">
                        {model.name}
                    </h1>
                    <p className="text-sm text-txt-secondary">{model.description}</p>
                </div>

                {/* Tags */}
                {model.tags?.length > 0 && (
                    <div>
                        <h3 className="text-lg font-semibold text-txt-primary mb-2">
                            Tags
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {model.tags.map((tag, i) => (
                                <span
                                    key={i}
                                    className="px-3 py-1 text-sm rounded-full bg-gray-200"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-1 gap-4">
                    <div className="flex flex-col gap-4">
                        <LikeButton
                            modelId={model.id}
                            initialLikes={model.likes}
                            currentUser={currentUser}
                            openAuthModal={openAuthModal}
                        />
                        <FavoritesButton
                            modelId={model.id}
                            currentUser={currentUser}
                            openAuthModal={openAuthModal}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        {model.originalFileUrl && (
                            <button
                                onClick={() =>
                                    window.open(model.originalFileUrl, "_blank")
                                }
                                className="bg-btn-primary text-white py-2 px-4 rounded-lg hover:bg-btn-primary-hover transition-colors text-sm lg:text-base"
                            >
                                Download Original
                            </button>
                        )}
                        {fallback3DUrl && fallback3DUrl !== model.originalFileUrl && (
                            <button
                                onClick={() => window.open(fallback3DUrl, "_blank")}
                                className="bg-btn-primary text-white py-2 px-4 rounded-lg hover:bg-btn-primary-hover transition-colors text-sm lg:text-base"
                            >
                                Download (glTF)
                            </button>
                        )}
                    </div>
                </div>

                {/* Edit Button */}
                {currentUser && currentUser.uid === model.userId && (
                    <Link
                        to={`/model/${model.id}/edit`}
                        className="block text-center bg-btn-secondary text-white py-2 px-4 rounded-lg hover:bg-btn-secondary-hover transition-colors text-sm lg:text-base"
                    >
                        Edit Model
                    </Link>
                )}

                {/* Comments Section */}
                <CommentsProvider modelId={model.id}>
                    <Comments openAuthModal={openAuthModal} />
                </CommentsProvider>
            </aside>
        </div>
    );
};

ModelView.propTypes = {
    openAuthModal: PropTypes.func.isRequired,
};
