// ModelView.jsx
import React from "react";
import { useParams } from "react-router-dom";
import { useModels } from "../../contexts/modelsContext";

export const ModelView = () => {
    const { id } = useParams();
    const { models, loading } = useModels();

    // If we're still loading the Firestore data
    if (loading) {
        return <p className="p-4">Loading model...</p>;
    }

    // Find the model by its Firestore doc ID
    const model = models.find((m) => m.id === id);
    if (!model) {
        return <p className="p-4">Model not found!</p>;
    }

    // We'll use the .convertedFileUrl if available (e.g. STL→GLTF).
    // If it doesn't exist, we can fallback to .originalFileUrl or show a message.
    const viewerUrl = model.convertedFileUrl || model.originalFileUrl;

    return (
        <div className="p-8 flex flex-col items-center">
            <h1 className="text-2xl font-bold mb-4">
                {model.name || "Untitled Model"}
            </h1>

            {/* 3D Model Viewer */}
            {viewerUrl ? (
                <model-viewer
                    src={viewerUrl}
                    alt="3D Model Viewer"
                    camera-controls
                    auto-rotate
                    style={{
                        width: "100%",
                        maxWidth: "800px",
                        height: "500px",
                        border: "1px solid #ccc",
                        borderRadius: "8px",
                    }}
                />
            ) : (
                <div className="border w-full max-w-2xl h-64 mb-6 flex items-center justify-center text-txt-secondary bg-bg-secondary rounded">
                    <p>No 3D preview available</p>
                </div>
            )}

            {/* Additional model data */}
            <div className="mt-6 text-base">
                <p className="mb-2">
                    <strong>Author:</strong> {model.userId || "Anonymous"}
                </p>
                <p className="mb-2">
                    <strong>Description:</strong>{" "}
                    {model.description || "No description yet"}
                </p>
                <p className="mb-2">
                    <strong>Tags:</strong>{" "}
                    {model.tags && model.tags.length
                        ? model.tags.join(", ")
                        : "No tags"}
                </p>
            </div>

            {/* Download links (original / converted) */}
            <div className="mt-4">
                {model.originalFileUrl && (
                    <a
                        href={model.originalFileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-blue-600 text-white py-2 px-4 rounded mr-2 hover:bg-blue-700"
                    >
                        Download Original
                    </a>
                )}
                {model.convertedFileUrl &&
                    model.convertedFileUrl !== model.originalFileUrl && (
                        <a
                            href={model.convertedFileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
                        >
                            Download Converted (glTF)
                        </a>
                    )}
            </div>
        </div>
    );
};
