import React from "react";
import { useParams } from "react-router-dom";
import { useModels } from "../../contexts/modelsContext";
import { getAuth } from "firebase/auth";

export const ModelView = () => {
    const { id } = useParams();
    const { models, loading } = useModels();
    const auth = getAuth();
    const user = auth.currentUser;

    if (loading) {
        return (
            <p className="text-center text-txt-primary mt-20">
                Loading model...
            </p>
        );
    }

    const model = models.find((m) => m.id === id);
    if (!model) {
        return (
            <p className="text-center text-txt-primary mt-20">
                Model not found!
            </p>
        );
    }

    const viewerUrl = model.convertedFileUrl; // .gltf if stl/obj, or fallback

    return (
        <div className="bg-bg-primary text-txt-primary min-h-screen p-6 flex flex-col lg:flex-row">
            <section className="w-full mb-8 p-4 bg-bg-surface rounded-md shadow-md">
                <h2 className="text-2xl font-semibold mb-4">
                    Additional Preview & Features
                </h2>
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="lg:w-1/2 border-2">
                        {viewerUrl ? (
                            <model-viewer
                                src={viewerUrl}
                                alt="3D Model"
                                camera-controls
                                auto-rotate
                                crossOrigin="anonymous"
                                environment-image="neutral"
                                style={{ width: "600px", height: "400px" }}
                            ></model-viewer>
                        ) : (
                            <div className="border w-full h-64 flex items-center justify-center text-txt-secondary bg-bg-secondary rounded">
                                <p>No 3D preview available</p>
                            </div>
                        )}
                    </div>
                    <div className="lg:w-1/2">
                        <h3 className="text-xl font-bold mb-2">Key Features</h3>
                        <ul className="list-disc list-inside text-txt-secondary">
                            <li>High-resolution geometry</li>
                            <li>Supports multiple formats (STL, glTF)</li>
                            <li>Ideal for 3D printing</li>
                            <li>Optimized for real-time rendering</li>
                        </ul>
                        <div className="mt-4 space-y-1">
                            <p>
                                <strong>Format: </strong>
                                {model.convertedFileUrl &&
                                model.convertedFileUrl !== model.originalFileUrl
                                    ? "glTF"
                                    : "STL"}
                            </p>
                            <p>
                                <strong>File Name: </strong>
                                {model.name}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <div className="flex-1 lg:h-screen lg:overflow-auto">
                {viewerUrl ? (
                    <model-viewer
                        src={viewerUrl}
                        alt="3D Model"
                        camera-controls
                        auto-rotate
                        crossOrigin="anonymous"
                        environment-image="neutral"
                        style={{ width: "100%", height: "500px" }}
                    ></model-viewer>
                ) : (
                    <div className="border w-full max-w-2xl h-64 flex items-center justify-center text-txt-secondary bg-bg-secondary rounded">
                        <p>No 3D preview available</p>
                    </div>
                )}
            </div>

            <aside className="w-full lg:w-[360px] mt-6 lg:mt-0 lg:ml-8 bg-bg-surface py-6 px-8 rounded-md shadow-md lg:h-screen lg:overflow-y-auto">
                {user && (
                    <div className="flex items-center pb-4 border-b border-br-primary">
                        <img
                            src={user.photoURL || "/default-avatar.png"}
                            alt={user.displayName || "Unknown User"}
                            className="w-16 h-16 rounded-full"
                        />
                        <div className="ml-3">
                            <h2 className="text-lg font-semibold">
                                {user.displayName || "Anonymous"}
                            </h2>
                        </div>
                    </div>
                )}

                <div className="mt-4">
                    <h1 className="text-2xl font-bold">{model.name}</h1>
                    <div className="mt-3 flex justify-between text-txt-secondary">
                        <div className="flex items-center gap-2">
                            <i className="fas fa-heart text-error"></i>
                            <span>{model.likes || 0} Likes</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <i className="fas fa-eye text-txt-highlight"></i>
                            <span>{model.views || 0} Views</span>
                        </div>
                    </div>
                    <hr className="border-br-primary my-4" />
                    <div className="grid grid-cols-2 gap-2 lg:flex lg:flex-col">
                        <button className="bg-btn-secondary text-txt-primary font-medium py-2 rounded-lg hover:bg-btn-secondary-hover">
                            Like
                        </button>
                        <button className="bg-btn-secondary text-txt-primary font-medium py-2 rounded-lg hover:bg-btn-secondary-hover">
                            Save
                        </button>
                        {model.originalFileUrl && (
                            <button
                                onClick={() =>
                                    window.open(model.originalFileUrl, "_blank")
                                }
                                className="bg-btn-primary text-white font-medium py-2 rounded-lg hover:bg-btn-primary-hover"
                            >
                                Download Original
                            </button>
                        )}
                        {model.convertedFileUrl &&
                            model.convertedFileUrl !==
                                model.originalFileUrl && (
                                <button
                                    onClick={() =>
                                        window.open(
                                            model.convertedFileUrl,
                                            "_blank"
                                        )
                                    }
                                    className="bg-btn-primary text-white font-medium py-2 rounded-lg hover:bg-btn-primary-hover"
                                >
                                    Download Converted (glTF)
                                </button>
                            )}
                    </div>

                    <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-2">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                            {(model.tags || []).map((tag, index) => (
                                <span
                                    key={index}
                                    className="bg-bg-primary px-3 py-1 text-sm rounded-md"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                    <p className="text-txt-secondary mt-6">
                        {model.description}
                    </p>
                </div>
            </aside>
        </div>
    );
};
