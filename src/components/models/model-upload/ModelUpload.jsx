import { useState } from "react";
import { useAuth } from "../../../contexts/authContext";
import { useModels } from "../../../contexts/modelsContext";
import { localConvertToGLBForPreview } from "../../../utils/converter";

export const ModelUpload = () => {
    const { currentUser } = useAuth();
    const { createModelInContext } = useModels();

    // Use an array for tags now instead of a string.
    const [modelData, setModelData] = useState({
        name: "",
        description: "",
        tags: [], // <-- tags as array
        file: null,
        convertedUrl: null,
        renderFiles: [],
        renderPreviewUrls: [],
        selectedRenderIndex: 0,
    });

    const [isConverting, setIsConverting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState("");

    // Predefined available tags
    const availableTags = [
        "3D",
        "2D",
        "Concept Art",
        "Anime",
        "Realistic",
        "Cartoon",
        "Abstract",
        "Sculpture",
        "Industrial",
        "Fantasy",
    ];

    const handleDragOver = (e) => e.preventDefault();

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) {
            setModelData((prev) => ({
                ...prev,
                file,
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
                    convertedUrl: URL.createObjectURL(file),
                }));
            } else {
                setModelData((prev) => ({
                    ...prev,
                    file,
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

    // Toggle tag selection
    const handleTagClick = (tag) => {
        setModelData((prev) => {
            const currentTags = prev.tags;
            if (currentTags.includes(tag)) {
                return { ...prev, tags: currentTags.filter((t) => t !== tag) };
            } else {
                return { ...prev, tags: [...currentTags, tag] };
            }
        });
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
            const { blobUrl } = await localConvertToGLBForPreview(modelData.file);
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
                // Pass tags array directly
                tags: modelData.tags,
                file: modelData.file,
                renderFiles: modelData.renderFiles,
                selectedRenderIndex: modelData.selectedRenderIndex,
                uploaderId: currentUser?.uid || "anonymous",
                onProgress: setUploadProgress,
            });
            alert("Model published successfully!");
            setModelData({
                name: "",
                description: "",
                tags: [],
                file: null,
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
        <div className="min-h-screen p-6 flex flex-col items-center bg-bg-primary">
            <h1 className="text-2xl font-semibold text-txt-primary mb-6">
                Two-Step Model Upload
            </h1>
            {error && <p className="text-fuchsia-600 mb-4 text-center">{error}</p>}

            <form
                onSubmit={handleSubmit}
                className="w-full max-w-6xl bg-bg-surface rounded-lg shadow-xl p-6 space-y-8"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-6">
                        {/* Model Name */}
                        <div>
                            <label className="block text-txt-secondary font-medium mb-2">
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
                                className="w-full px-4 py-2 border border-br-primary rounded-md focus:ring-2 focus:ring-btn-primary"
                                placeholder="e.g. Medieval Castle"
                                required
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-txt-secondary font-medium mb-2">
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
                                className="w-full px-4 py-2 border border-br-primary rounded-md focus:ring-2 focus:ring-btn-primary"
                                rows="4"
                            />
                        </div>

                        {/* Tag Selection */}
                        <div className="border-2 border-dashed border-br-primary rounded-md p-4">
                            <h4 className="text-lg font-semibold mb-2 text-center">
                                Select Tags
                            </h4>
                            <div className="flex flex-wrap gap-2 justify-center">
                                {availableTags.map((tag) => (
                                    <span
                                        key={tag}
                                        onClick={() => handleTagClick(tag)}
                                        className={`cursor-pointer px-4 py-2 rounded-full text-sm transition-colors ${modelData.tags.includes(tag)
                                                ? "bg-btn-primary text-white border border-btn-primary"
                                                : "bg-bg-surface text-txt-secondary border border-br-primary"
                                            }`}
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                            <input
                                type="text"
                                placeholder="Selected Tags"
                                readOnly
                                value={modelData.tags.join(", ")}
                                className="mt-2 w-full px-4 py-2 border border-br-primary rounded-md bg-gray-100 text-sm"
                            />
                        </div>

                        {/* Model File Input */}
                        <div
                            className="border-2 border-dashed border-br-primary rounded-md p-4 text-center"
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

                        {/* Render Images Input */}
                        <div className="border-2 border-dashed border-br-primary rounded-md p-4 text-center">
                            {modelData.renderFiles.length > 0 ? (
                                <div>
                                    <p>
                                        {modelData.renderFiles.length} render file(s)
                                        selected.
                                    </p>
                                    <div className="flex space-x-2 mt-2 overflow-auto">
                                        {modelData.renderPreviewUrls.map((url, index) => (
                                            <div
                                                key={index}
                                                className={`cursor-pointer border-4 ${modelData.selectedRenderIndex ===
                                                        index
                                                        ? "border-accent"
                                                        : "border-transparent"
                                                    }`}
                                                onClick={() =>
                                                    setModelData((prev) => ({
                                                        ...prev,
                                                        selectedRenderIndex: index,
                                                    }))
                                                }
                                            >
                                                <img
                                                    src={url}
                                                    alt={`Render ${index + 1}`}
                                                    className="w-16 h-16 object-cover"
                                                />
                                            </div>
                                        ))}
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

                        {/* Buttons */}
                        <button
                            type="button"
                            disabled={!modelData.file || isConverting}
                            onClick={() =>
                                handleConvertPreview(
                                    modelData.file,
                                    setModelData,
                                    setIsConverting,
                                    setError
                                )
                            }
                            className="w-full bg-blue-600 text-white py-2 rounded-md disabled:opacity-50"
                        >
                            {isConverting ? "Converting..." : "Convert & Preview"}
                        </button>

                        {isUploading && (
                            <div className="w-full bg-gray-300 rounded-md h-2 mt-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-md"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isUploading || isConverting}
                            className="w-full bg-btn-primary text-white py-2 rounded-md disabled:opacity-50"
                        >
                            {isUploading ? "Publishing..." : "Publish Model"}
                        </button>
                    </div>

                    {/* Right column: Local preview */}
                    <div className="space-y-4">
                        <h3 className="mt-4 mb-2 text-center text-xl">3D Model Preview</h3>
                        {modelData.convertedUrl ? (
                            <model-viewer
                                src={modelData.convertedUrl}
                                alt="Converted 3D"
                                camera-controls
                                auto-rotate
                                crossOrigin="anonymous"
                                className="w-full h-[300px] border rounded-md"
                            />
                        ) : (
                            <div className="w-full h-[300px] border rounded-md flex items-center justify-center">
                                <p>No 3D preview</p>
                            </div>
                        )}

                        <h3 className="mt-4 mb-2 text-center text-xl">Render Image Preview</h3>
                        {modelData.renderPreviewUrls.length > 0 ? (
                            <img
                                src={modelData.renderPreviewUrls[modelData.selectedRenderIndex]}
                                alt="Render Image"
                                className="w-full h-[300px] object-cover border rounded-md"
                            />
                        ) : (
                            <div className="w-full h-[300px] border rounded-md flex items-center justify-center">
                                <p>No render preview</p>
                            </div>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
};
