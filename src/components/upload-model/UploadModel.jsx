// UploadModel.jsx
import React, { useState } from "react";
import { useAuth } from "../../contexts/authContext";
import { useModels } from "../../contexts/modelsContext";

export const UploadModel = () => {
    const { currentUser } = useAuth();
    const { createModelInContext } = useModels();

    const [modelName, setModelName] = useState("");
    const [description, setDescription] = useState("");
    const [tags, setTags] = useState("");
    const [file, setFile] = useState(null);

    // Local preview
    const [previewUrl, setPreviewUrl] = useState(null);

    // Progress states
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState("");

    // Drag & drop
    function handleDragOver(e) {
        e.preventDefault();
    }
    function handleDrop(e) {
        e.preventDefault();
        if (e.dataTransfer.files?.[0]) {
            const droppedFile = e.dataTransfer.files[0];
            setFile(droppedFile);
            setPreviewUrl(URL.createObjectURL(droppedFile));
        }
    }

    // On file select
    function handleFileChange(e) {
        if (e.target.files?.[0]) {
            const chosenFile = e.target.files[0];
            setFile(chosenFile);
            setPreviewUrl(URL.createObjectURL(chosenFile));
        }
    }

    // On form submit
    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setUploadProgress(0);

        if (!file) {
            setError("Please select a file");
            return;
        }
        if (!modelName.trim()) {
            setError("Please enter a name");
            return;
        }

        setIsUploading(true);
        try {
            // Call context method
            await createModelInContext({
                name: modelName,
                description,
                tags: tags.split(",").map((t) => t.trim()),
                file,
                userId: currentUser?.uid || "anonymous",
                onProgress: (p) => setUploadProgress(p),
            });

            alert("Model uploaded successfully!");
            // Reset
            setModelName("");
            setDescription("");
            setTags("");
            setFile(null);
            setPreviewUrl(null);
            setUploadProgress(0);
        } catch (err) {
            console.error(err);
            setError("Upload failed. Check console for details.");
        }
        setIsUploading(false);
    }

    return (
        <div className="min-h-screen p-8 flex flex-col items-center bg-bg-primary">
            <h1 className="text-3xl font-bold text-txt-primary mb-6">
                Upload 3D Printable Model
            </h1>

            {error && <p className="text-red-600 mb-4">{error}</p>}

            <form
                onSubmit={handleSubmit}
                className="w-full max-w-4xl bg-bg-surface rounded-lg shadow-xl p-6 space-y-6"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-6">
                        {/* Model Name */}
                        <div>
                            <label className="block text-txt-secondary font-medium mb-1">
                                Model Name
                            </label>
                            <input
                                type="text"
                                value={modelName}
                                onChange={(e) => setModelName(e.target.value)}
                                className="text-txt-primary placeholder-txt-muted w-full px-3 py-2 border-2 border-br-primary rounded-lg"
                                placeholder="E.g. Medieval Castle Tower"
                                required
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-txt-secondary font-medium mb-1">
                                Description
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="text-txt-primary placeholder-txt-muted w-full px-3 py-2 border-2 border-br-primary rounded-lg"
                                rows="4"
                                placeholder="Dimensions, usage, etc."
                            />
                        </div>

                        {/* Tags */}
                        <div>
                            <label className="block text-txt-secondary font-medium mb-1">
                                Tags (comma-separated)
                            </label>
                            <input
                                type="text"
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                className="text-txt-primary placeholder-txt-muted w-full px-3 py-2 border-2 border-br-primary rounded-lg"
                                placeholder="architecture, tower, etc."
                            />
                        </div>

                        {/* Drag/Drop File */}
                        <div
                            className="border-2 border-dashed border-br-primary rounded-lg p-6 text-center"
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                        >
                            {file ? (
                                <div className="flex flex-col items-center">
                                    <i className="fas fa-check-circle text-success mb-2"></i>
                                    <span className="text-txt-primary">
                                        {file.name}
                                    </span>
                                </div>
                            ) : (
                                <>
                                    <p className="text-txt-primary mb-2">
                                        Drag & drop your file here
                                    </p>
                                    <p className="text-txt-secondary text-sm">
                                        or click below to browse
                                    </p>
                                    <div className="mt-4">
                                        <label
                                            htmlFor="fileInput"
                                            className="bg-btn-primary text-white py-2 px-4 rounded cursor-pointer hover:bg-btn-primary-hover"
                                        >
                                            Choose a file
                                        </label>
                                        <input
                                            id="fileInput"
                                            type="file"
                                            accept=".stl,.obj,.zip"
                                            className="hidden"
                                            onChange={handleFileChange}
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Progress Bar */}
                        {isUploading && (
                            <div className="w-full bg-bg-secondary rounded-full h-4 mt-2">
                                <div
                                    className="bg-accent h-4 rounded-full transition-all duration-200"
                                    style={{ width: `${uploadProgress}%` }}
                                ></div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isUploading}
                            className="w-full bg-btn-primary text-white text-lg font-medium py-2 rounded"
                        >
                            {isUploading ? "Uploading..." : "Publish Model"}
                        </button>
                    </div>

                    {/* Right Column: local preview */}
                    <div className="flex flex-col items-center justify-center">
                        <h2 className="text-xl font-bold text-txt-primary mb-4">
                            Model Preview
                        </h2>
                        {previewUrl ? (
                            <img
                                src={previewUrl}
                                alt="Preview of uploaded model"
                                style={{
                                    width: "100%",
                                    height: "400px",
                                    borderRadius: "0.5rem",
                                    border: "1px solid var(--br-primary)",
                                    objectFit: "cover",
                                }}
                            />
                        ) : (
                            <div className="flex items-center justify-center w-full h-64 border-2 border-dashed border-br-primary rounded-lg">
                                <p className="text-txt-secondary">
                                    No model preview
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
};
