import { useState, useRef } from "react";
import { useAuth } from "../../contexts/authContext";
import { useModels } from "../../contexts/modelsContext";
import { localConvertToGLBForPreview } from "../../utils/converter";

export const UploadModel = () => {
    const { currentUser } = useAuth();
    const { createModelInContext } = useModels();

    const [modelName, setModelName] = useState("");
    const [description, setDescription] = useState("");
    const [tags, setTags] = useState("");
    const [file, setFile] = useState(null);

    // For local 2-step preview
    const [localPreviewUrl, setLocalPreviewUrl] = useState(null); // raw file URL
    const [convertedUrl, setConvertedUrl] = useState(null); // .glb for local preview

    const [isConverting, setIsConverting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState("");

    // Just references for a possible Web Worker scenario
    const workerRef = useRef(null);

    function handleFileChange(e) {
        if (e.target.files?.[0]) {
            const chosenFile = e.target.files[0];
            setFile(chosenFile);
            setLocalPreviewUrl(URL.createObjectURL(chosenFile));
            setConvertedUrl(null);
        }
    }

    function handleDragOver(e) {
        e.preventDefault();
    }

    function handleDrop(e) {
        e.preventDefault();
        if (e.dataTransfer.files?.[0]) {
            const chosenFile = e.dataTransfer.files[0];
            setFile(chosenFile);
            setLocalPreviewUrl(URL.createObjectURL(chosenFile));
            setConvertedUrl(null);
        }
    }

    // Convert for local 3D preview
    async function handleConvertPreview() {
        if (!file) {
            setError("No file selected.");
            return;
        }
        const lower = file.name.toLowerCase();
        if (!lower.endsWith(".stl") && !lower.endsWith(".obj")) {
            setError("Only .stl/.obj supported for local preview conversion.");
            return;
        }

        setIsConverting(true);
        setError("");

        try {
            const { blob, blobUrl } = await localConvertToGLBForPreview(file);
            setConvertedUrl(blobUrl);
        } catch (err) {
            console.error("Convert error:", err);
            setError("Conversion failed. Check console for details.");
        }

        setIsConverting(false);
    }

    // Final "Publish"
    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setUploadProgress(0);

        if (!file) {
            setError("Please select a file first.");
            return;
        }
        if (!modelName.trim()) {
            setError("Please enter a model name.");
            return;
        }

        setIsUploading(true);

        try {
            await createModelInContext({
                name: modelName,
                description,
                tags: tags.split(",").map((t) => t.trim()),
                file,
                userId: currentUser?.uid || "anonymous",
                onProgress: (p) => setUploadProgress(p),
            });
            alert("Model published successfully!");
            // reset
            setModelName("");
            setDescription("");
            setTags("");
            setFile(null);
            setLocalPreviewUrl(null);
            setConvertedUrl(null);
            setUploadProgress(0);
        } catch (err) {
            console.error("Publish error:", err);
            setError("Upload failed. Check console for details.");
        }

        setIsUploading(false);
    }

    return (
        <div className="min-h-screen p-8 flex flex-col items-center bg-bg-primary">
            <h1 className="text-3xl font-bold text-txt-primary mb-6">
                Two-Step Model Upload
            </h1>
            {error && <p className="text-red-600 mb-4">{error}</p>}

            <form
                onSubmit={handleSubmit}
                className="w-full max-w-4xl bg-bg-surface rounded-lg shadow-xl p-6 space-y-6"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left column */}
                    <div className="space-y-4">
                        {/* Model Name */}
                        <div>
                            <label className="block text-txt-secondary font-medium mb-1">
                                Model Name
                            </label>
                            <input
                                type="text"
                                value={modelName}
                                onChange={(e) => setModelName(e.target.value)}
                                className="w-full px-3 py-2 border border-br-primary rounded"
                                placeholder="e.g. Medieval Castle"
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
                                className="w-full px-3 py-2 border border-br-primary rounded"
                                rows="4"
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
                                className="w-full px-3 py-2 border border-br-primary rounded"
                            />
                        </div>

                        {/* Drag/Drop */}
                        <div
                            className="border-2 border-dashed border-br-primary rounded p-4 text-center"
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                        >
                            {file ? (
                                <div>
                                    <p>Selected file: {file.name}</p>
                                </div>
                            ) : (
                                <>
                                    <p>Drag and drop .stl/.obj here</p>
                                    <label className="mt-2 inline-block bg-btn-primary text-white px-4 py-2 rounded cursor-pointer">
                                        Choose File
                                        <input
                                            type="file"
                                            accept=".stl,.obj,.zip"
                                            className="hidden"
                                            onChange={handleFileChange}
                                        />
                                    </label>
                                </>
                            )}
                        </div>

                        {/* Step 1: Convert & Preview */}
                        <button
                            type="button"
                            disabled={!file || isConverting}
                            onClick={handleConvertPreview}
                            className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
                        >
                            {isConverting
                                ? "Converting..."
                                : "Convert & Preview"}
                        </button>

                        {/* Step 2: Publish */}
                        {isUploading && (
                            <div className="w-full bg-gray-300 rounded h-4 mt-2">
                                <div
                                    className="bg-blue-600 h-4 rounded"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                        )}
                        <button
                            type="submit"
                            disabled={isUploading || isConverting}
                            className="w-full bg-btn-primary text-white py-2 rounded disabled:opacity-50"
                        >
                            {isUploading ? "Publishing..." : "Publish Model"}
                        </button>
                    </div>

                    {/* Right column: local preview */}
                    <div>
                        <h2 className="text-xl font-bold mb-2">
                            Local Preview
                        </h2>
                        {/* 1) Raw file preview (for .zip or .obj won't show 3D, but let's show an image anyway) */}
                        {localPreviewUrl ? (
                            <img
                                src={localPreviewUrl}
                                alt="File preview (raw)"
                                className="w-full h-40 object-cover border"
                            />
                        ) : (
                            <div className="w-full h-40 border flex items-center justify-center">
                                <p>No raw preview</p>
                            </div>
                        )}

                        {/* 2) 3D model-viewer from the local conversion */}
                        <h3 className="mt-4 mb-2">3D Converted Preview</h3>
                        {convertedUrl ? (
                            <model-viewer
                                src={convertedUrl}
                                alt="Converted 3D"
                                camera-controls
                                auto-rotate
                                crossOrigin="anonymous"
                                style={{
                                    width: "100%",
                                    height: "300px",
                                    border: "1px solid #ccc",
                                }}
                            />
                        ) : (
                            <div className="w-full h-40 border flex items-center justify-center">
                                <p>No 3D conversion preview</p>
                            </div>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
};
