import { useParams, Link } from "react-router-dom";
import { useModels } from "../../../contexts/modelsContext";
import { useAuth } from "../../../contexts/authContext";
import { Comments } from "../model-comments/ModelComments";
import { CommentsProvider } from "../../../contexts/CommentsContext";
import { useEffect } from "react";
import LazyImage from "../../shared/lazy-image/LazyImage";
import LikeButton from "../model-actions/likeButton";
import FavoritesButton from "../model-actions/favoritesButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";

export const ModelView = ({ openAuthModal }) => {
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

    useEffect(() => {
        const model = models.find((m) => m.id === id);
        if (model && model.uploaderId) {
            fetchUploader(model.uploaderId);
        }
    }, [id, models, fetchUploader]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-xl text-txt-primary">
                Loading model...
            </div>
        );
    }

    const model = models.find((m) => m.id === id);
    if (!model) {
        return (
            <div className="min-h-screen flex items-center justify-center text-xl text-txt-primary">
                Model not found!
            </div>
        );
    }

    const fallback3DUrl = model.convertedFileUrl || model.originalFileUrl || "";
    const renderFileUrls = model.renderFileUrls || [];

    const mainPreview =
        selectedRenderIndex === -1 ? (
            fallback3DUrl ? (
                <model-viewer
                    src={fallback3DUrl}
                    alt="3D Model"
                    camera-controls
                    auto-rotate
                    crossOrigin="anonymous"
                    environment-image="neutral"
                    className="rounded-md shadow-lg h-[calc(90vh-120px)] w-auto"
                ></model-viewer>
            ) : (
                <div className="flex items-center justify-center w-full h-[calc(90vh-120px)] bg-gray-200 rounded-md">
                    No 3D preview available
                </div>
            )
        ) : (
            <LazyImage
                src={renderFileUrls[selectedRenderIndex]}
                alt={`Render ${selectedRenderIndex + 1}`}
                loading="lazy"
                className="w-full m-auto h-[calc(90vh-120px)] object-contain rounded-md shadow-lg"
            />
        );

    return (
        <div className="bg-bg-primary text-txt-primary min-h-screen p-6 flex flex-col lg:flex-row gap-8">
            {/* Left Side: Main preview & thumbnails */}
            <div className="flex-1">
                <div className="relative">{mainPreview}</div>
                <div className="mt-4 flex space-x-4 overflow-x-auto pb-2">
                    {/* 3D Model Thumbnail */}
                    <div
                        onClick={() => setSelectedRenderIndex(-1)}
                        className={`flex-shrink-0 w-20 h-20 border-4 rounded-md cursor-pointer overflow-hidden ${
                            selectedRenderIndex === -1
                                ? "border-fuchsia-600"
                                : "border-transparent hover:border-fuchsia-500"
                        }`}
                    >
                        {fallback3DUrl ? (
                            <model-viewer
                                src={fallback3DUrl}
                                alt="3D thumb"
                                camera-controls
                                auto-rotate
                                loading="lazy"
                                style={{ width: "100%", height: "100%" }}
                                environment-image="neutral"
                                className="object-cover"
                            ></model-viewer>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-xs">
                                3D
                            </div>
                        )}
                    </div>
                    {/* Render Images Thumbnails */}
                    {renderFileUrls.map((url, idx) => (
                        <div
                            key={idx}
                            onClick={() => setSelectedRenderIndex(idx)}
                            className={`flex-shrink-0 w-20 h-20 border-4 rounded-md cursor-pointer overflow-hidden ${
                                selectedRenderIndex === idx
                                    ? "border-fuchsia-600"
                                    : "border-transparent hover:border-fuchsia-500"
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

            {/* Right Side: Info Sidebar */}
            <aside className="w-full lg:w-96 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl space-y-8">
                {/* Uploader Info */}
                {uploader && (
                    <div className="flex items-center space-x-4 border-b pb-4">
                        <img
                            src={uploader.photoURL || "/default-avatar.png"}
                            alt={uploader.displayName || "Unknown User"}
                            className="w-16 h-16 rounded-full object-cover"
                        />
                        <div>
                            <h2 className="text-lg font-bold text-txt-primary">
                                {uploader.displayName || "Anonymous"}
                            </h2>
                        </div>
                    </div>
                )}

                {/* Model Title & Description */}
                <div>
                    <h1 className="text-2xl font-bold text-txt-primary mb-2">
                        {model.name}
                    </h1>
                    <p className="text-sm text-txt-secondary">{model.description}</p>
                </div>

                {/* Tags */}
                {model.tags && model.tags.length > 0 && (
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

                {/* Actions */}
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
                                className="bg-btn-primary text-white py-2 rounded hover:bg-btn-primary-hover transition-colors"
                            >
                                Download Original
                            </button>
                        )}
                        {fallback3DUrl && fallback3DUrl !== model.originalFileUrl && (
                            <button
                                onClick={() => window.open(fallback3DUrl, "_blank")}
                                className="bg-btn-primary text-white py-2 rounded hover:bg-btn-primary-hover transition-colors"
                            >
                                Download (glTF)
                            </button>
                        )}
                    </div>
                </div>

                {currentUser && currentUser.uid === model.userId && (
                    <Link
                        to={`/model/${model.id}/edit`}
                        className="block text-center bg-btn-secondary text-white py-2 px-4 rounded hover:bg-btn-secondary-hover transition-colors"
                    >
                        Edit Model
                    </Link>
                )}

                <CommentsProvider modelId={model.id}>
                    <Comments />
                </CommentsProvider>
            </aside>
        </div>
    );
};
