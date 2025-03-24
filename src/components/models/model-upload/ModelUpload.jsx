import { useState } from "react";
import { useAuth } from "../../../contexts/authContext";
import { useModels } from "../../../contexts/modelsContext";
import { localConvertToGLBForPreview } from "../../../utils/converter";

export const ModelUpload = () => {
    const { currentUser } = useAuth();
    const { createModelInContext } = useModels();

    // Extend state to include multiple render images and the index of the primary one
    const [modelData, setModelData] = useState({
        name: "",
        description: "",
        tags: "",
        file: null,
        localPreviewUrl: null,
        convertedUrl: null,
        // New fields for render images:
        renderFiles: [],
        renderPreviewUrls: [],
        selectedRenderIndex: 0, // default: first render image
    });
    const [isConverting, setIsConverting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState("");

    const handleDragOver = (e) => e.preventDefault();

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) {
            setModelData((prev) => ({
                ...prev,
                file,
                localPreviewUrl: URL.createObjectURL(file),
                convertedUrl: null,
            }));
        }
    };

    // Handler for main model file
    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const lower = file.name.toLowerCase();
            if (lower.endsWith(".gltf") || lower.endsWith(".glb")) {
                setModelData((prev) => ({
                    ...prev,
                    file,
                    localPreviewUrl: URL.createObjectURL(file),
                    convertedUrl: URL.createObjectURL(file),
                }));
            } else {
                setModelData((prev) => ({
                    ...prev,
                    file,
                    localPreviewUrl: URL.createObjectURL(file),
                    convertedUrl: null,
                }));
            }
        }
    };

    // New handler for multiple render images (allow multiple selection)
    const handleRenderFilesChange = (e) => {
        const files = Array.from(e.target.files);
        const previewUrls = files.map((f) => URL.createObjectURL(f));
        setModelData((prev) => ({
            ...prev,
            renderFiles: files,
            renderPreviewUrls: previewUrls,
            selectedRenderIndex: 0, // default to the first image
        }));
    };

    const handleConvertPreview = async () => {
        if (!modelData.file) {
            setError("No file selected.");
            return;
        }
        const lower = modelData.file.name.toLowerCase();
        if (lower.endsWith(".gltf") || lower.endsWith(".glb")) {
            setError("GLTF/GLB files don't require conversion.");
            return;
        }
        if (!lower.endsWith(".stl") && !lower.endsWith(".obj")) {
            setError("Only .stl/.obj supported for local preview conversion.");
            return;
        }
        setIsConverting(true);
        setError("");
        try {
            const { blobUrl } = await localConvertToGLBForPreview(
                modelData.file
            );
            setModelData((prev) => ({ ...prev, convertedUrl: blobUrl }));
        } catch (err) {
            console.error("Convert error:", err);
            setError("Conversion failed. Check console for details.");
        } finally {
            setIsConverting(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setUploadProgress(0);

        if (!modelData.file) {
            setError("Please select a model file first.");
            return;
        }
        if (!modelData.name.trim()) {
            setError("Please enter a model name.");
            return;
        }
        setIsUploading(true);
        try {
            await createModelInContext({
                name: modelData.name,
                description: modelData.description,
                tags: modelData.tags.split(",").map((t) => t.trim()),
                file: modelData.file,
                // Pass multiple render files and the index of the primary render
                renderFiles: modelData.renderFiles,
                selectedRenderIndex: modelData.selectedRenderIndex,
                uploaderId: currentUser?.uid || "anonymous",
                onProgress: setUploadProgress,
            });
            alert("Model published successfully!");
            setModelData({
                name: "",
                description: "",
                tags: "",
                file: null,
                localPreviewUrl: null,
                convertedUrl: null,
                renderFiles: [],
                renderPreviewUrls: [],
                selectedRenderIndex: 0,
            });
            setUploadProgress(0);
        } catch (err) {
            console.error("Publish error:", err);
            setError("Upload failed. Check console for details.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="min-h-screen p-8 flex flex-col items-center bg-bg-primary">
            <h1 className="text-3xl font-bold text-txt-primary mb-6">
                Two-Step Model Upload
            </h1>
            {error && <p className="text-fuchsia-600 mb-4">{error}</p>}

            <form
                onSubmit={handleSubmit}
                className="w-full max-w-4xl bg-bg-surface rounded-lg shadow-xl p-6 space-y-6"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left column */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-txt-secondary font-medium mb-1">
                                Model Name
                            </label>
                            <input
                                type="text"
                                value={modelData.name}
                                onChange={(e) =>
                                    setModelData((prev) => ({
                                        ...prev,
                                        name: e.target.value,
                                    }))
                                }
                                className="w-full px-3 py-2 border border-br-primary rounded"
                                placeholder="e.g. Medieval Castle"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-txt-secondary font-medium mb-1">
                                Description
                            </label>
                            <textarea
                                value={modelData.description}
                                onChange={(e) =>
                                    setModelData((prev) => ({
                                        ...prev,
                                        description: e.target.value,
                                    }))
                                }
                                className="w-full px-3 py-2 border border-br-primary rounded"
                                rows="4"
                            />
                        </div>
                        <div>
                            <label className="block text-txt-secondary font-medium mb-1">
                                Tags (comma-separated)
                            </label>
                            <input
                                type="text"
                                value={modelData.tags}
                                onChange={(e) =>
                                    setModelData((prev) => ({
                                        ...prev,
                                        tags: e.target.value,
                                    }))
                                }
                                className="w-full px-3 py-2 border border-br-primary rounded"
                            />
                        </div>

                        {/* Model file input */}
                        <div
                            className="border-2 border-dashed border-br-primary rounded p-4 text-center"
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                        >
                            {modelData.file ? (
                                <p>Selected file: {modelData.file.name}</p>
                            ) : (
                                <>
                                    <p>Drag and drop .stl/.obj here</p>
                                    <label className="mt-2 inline-block bg-btn-primary text-white px-4 py-2 rounded cursor-pointer">
                                        Choose File
                                        <input
                                            type="file"
                                            accept=".stl,.obj,.zip,.gltf,.glb"
                                            className="hidden"
                                            onChange={handleFileChange}
                                        />
                                    </label>
                                </>
                            )}
                        </div>

                        {/* New render images input */}
                        <div className="border-2 border-dashed border-br-primary rounded p-4 text-center">
                            {modelData.renderFiles.length > 0 ? (
                                <div>
                                    <p>
                                        {modelData.renderFiles.length} render
                                        file(s) selected.
                                    </p>
                                    <div className="flex space-x-2 mt-2 overflow-auto">
                                        {modelData.renderPreviewUrls.map(
                                            (url, index) => (
                                                <div
                                                    key={index}
                                                    className={`cursor-pointer border-4 ${
                                                        modelData.selectedRenderIndex ===
                                                        index
                                                            ? "border-fuchsia-600"
                                                            : "border-transparent"
                                                    }`}
                                                    onClick={() =>
                                                        setModelData(
                                                            (prev) => ({
                                                                ...prev,
                                                                selectedRenderIndex:
                                                                    index,
                                                            })
                                                        )
                                                    }
                                                >
                                                    <img
                                                        src={url}
                                                        alt={`Render ${
                                                            index + 1
                                                        }`}
                                                        className="w-20 h-20 object-cover"
                                                    />
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <p>
                                        Upload render images for gallery preview
                                        (JPEG/PNG, multiple allowed)
                                    </p>
                                    <label className="mt-2 inline-block bg-btn-primary text-white px-4 py-2 rounded cursor-pointer">
                                        Choose Render Files
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            className="hidden"
                                            onChange={handleRenderFilesChange}
                                        />
                                    </label>
                                </>
                            )}
                        </div>

                        <button
                            type="button"
                            disabled={!modelData.file || isConverting}
                            onClick={handleConvertPreview}
                            className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
                        >
                            {isConverting
                                ? "Converting..."
                                : "Convert & Preview"}
                        </button>

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
                        {modelData.localPreviewUrl ? (
                            <img
                                src={modelData.localPreviewUrl}
                                alt="File preview (raw)"
                                className="w-full h-40 object-cover border"
                            />
                        ) : (
                            <div className="w-full h-40 border flex items-center justify-center">
                                <p>No raw preview</p>
                            </div>
                        )}

                        <h3 className="mt-4 mb-2">3D Converted Preview</h3>
                        {modelData.convertedUrl ? (
                            <model-viewer
                                src={modelData.convertedUrl}
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

                        <h3 className="mt-4 mb-2">Render Image Preview</h3>
                        {modelData.renderPreviewUrls.length > 0 ? (
                            <img
                                src={
                                    modelData.renderPreviewUrls[
                                        modelData.selectedRenderIndex
                                    ]
                                }
                                alt="Primary Render Preview"
                                className="w-full h-40 object-cover border"
                            />
                        ) : (
                            <div className="w-full h-40 border flex items-center justify-center">
                                <p>No render preview</p>
                            </div>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
};
