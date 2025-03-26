import { useParams, Link } from "react-router-dom";
import { useModels } from "../../../contexts/modelsContext";
import { useAuth } from "../../../contexts/authContext";
import { Comments } from "../model-comments/ModelComments";
import { CommentsProvider } from "../../../contexts/CommentsContext";
import { useEffect } from "react";

export const ModelView = () => {
    const { id } = useParams();
    const { models, loading, uploader, selectedRenderIndex, setSelectedRenderIndex, fetchUploader } = useModels();
    const auth = useAuth();
    const user = auth.currentUser;

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
            <img
                src={renderFileUrls[selectedRenderIndex]}
                alt={`Render ${selectedRenderIndex + 1}`}
                loading="lazy"
                className="w-full m-auto h-[calc(90vh-120px)] object-contain rounded-md shadow-lg"
            />
        );

    return (
        <div className="bg-bg-primary text-txt-primary min-h-screen p-6 flex flex-col lg:flex-row gap-8">
            {/* Left side: Main preview & thumbnails */}
            <div className="flex-1">
                <div className="relative">{mainPreview}</div>
                <div className="mt-4 flex space-x-4 overflow-x-auto pb-2">
                    {/* 3D model thumbnail */}
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

                    {/* Render images thumbnails */}
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
                            <img
                                src={url}
                                alt={`Render ${idx + 1}`}
                                loading="lazy"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Right side: Info sidebar */}
            <aside className="w-full lg:w-[360px] bg-bg-surface p-6 rounded-md shadow-lg space-y-6">
                {uploader ? (
                    <div className="flex items-center space-x-4 border-b pb-4">
                        <img
                            src={uploader.photoURL || "/user.png"}
                            alt={uploader.displayName || "Unknown User"}
                            className="w-16 h-16 rounded-full object-cover"
                        />
                        <div>
                            <h2 className="text-lg font-semibold">
                                {uploader.displayName || "Anonymous"}
                            </h2>
                        </div>
                    </div>
                ) : null}

                {/* Model info */}
                <div>
                    <h1 className="text-2xl font-bold">{model.name}</h1>
                    <p className="mt-2 text-gray-600">{model.description}</p>
                </div>

                {/* Likes / Views */}
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-1">
                        <i className="fas fa-heart text-red-500"></i>
                        <span>{model.likes || 0} Likes</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <i className="fas fa-eye text-blue-500"></i>
                        <span>{model.views || 0} Views</span>
                    </div>
                </div>

                {/* Tags Section */}
                <div>
                    <h3 className="text-lg font-semibold">Tags</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {(model.tags || []).map((tag, index) => (
                            <span
                                key={index}
                                className="px-3 py-1 rounded-full bg-gray-200 text-sm font-medium"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                    <button className="bg-btn-secondary text-txt-primary font-medium py-2 rounded-lg hover:bg-btn-secondary-hover">
                        Like
                    </button>
                    <button className="bg-btn-secondary text-txt-primary font-medium py-2 rounded-lg hover:bg-btn-secondary-hover">
                        Save
                    </button>
                    {model.originalFileUrl && (
                        <button
                            onClick={() => window.open(model.originalFileUrl, "_blank")}
                            className="bg-btn-primary text-white font-medium py-2 rounded-lg hover:bg-btn-primary-hover"
                        >
                            Download Original
                        </button>
                    )}
                    {fallback3DUrl && fallback3DUrl !== model.originalFileUrl && (
                        <button
                            onClick={() => window.open(fallback3DUrl, "_blank")}
                            className="bg-btn-primary text-white font-medium py-2 rounded-lg hover:bg-btn-primary-hover"
                        >
                            Download Converted (glTF)
                        </button>
                    )}
                </div>

                {/* Edit Model Button */}
                {model.userId && model.userId === user?.uid && (
                    <Link
                        to={`/model/${model.id}/edit`}
                        className="block text-center bg-btn-secondary text-white py-2 px-4 rounded hover:bg-btn-secondary-hover transition-colors"
                    >
                        Edit Model
                    </Link>
                )}

                {/* Comments Section */}
                <CommentsProvider modelId={model.id}>
                    <Comments />
                </CommentsProvider>
            </aside>
        </div>
    );
};
