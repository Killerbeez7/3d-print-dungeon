import { useState } from "react";
import { useAuth } from "../../../contexts/authContext";
import { useModels } from "../../../contexts/modelsContext";
import { localConvertToGLBForPreview } from "../../../utils/converter";

export const ModelUpload = () => {
    const { currentUser } = useAuth();
    const { createModelInContext } = useModels();

    const [modelData, setModelData] = useState({
        name: "",
        description: "",
        tags: [],
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

    // handle GLTF or GLB files (no convertion)
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

    // render files
    const handleRenderFilesChange = (e) => {
        const files = Array.from(e.target.files);
        const previewUrls = files.map((f) => URL.createObjectURL(f));
        setModelData((prev) => ({
            ...prev,
            renderFiles: files,
            renderPreviewUrls: previewUrls,
            selectedRenderIndex: 0,
        }));
    };

    // tag selection
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

    // convert and preview
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
        <div className="bg-bg-primary min-h-screen py-8 px-4">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-3xl font-bold text-txt-primary mb-6">
                    Upload Your 3D Model
                </h1>

                {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}

                <form
                    onSubmit={handleSubmit}
                    className="bg-bg-surface rounded-lg shadow-md p-6 space-y-8"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-6">
                            {/* Model Name */}
                            <div>
                                <label className="block text-sm font-semibold text-txt-secondary mb-2">
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
                                    placeholder="e.g. Medieval Castle"
                                    required
                                    className="w-full border border-br-primary rounded px-4 py-2 text-sm focus:border-accent focus:ring-accent"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-semibold text-txt-secondary mb-2">
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
                                    rows="4"
                                    className="w-full border border-br-primary rounded px-4 py-2 text-sm focus:border-accent focus:ring-accent"
                                />
                            </div>

                            {/* Tag Selection */}
                            <div className="border border-br-primary rounded p-4">
                                <h4 className="font-semibold mb-2">Select Tags</h4>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {availableTags.map((tag) => (
                                        <button
                                            type="button"
                                            key={tag}
                                            onClick={() => handleTagClick(tag)}
                                            className={`
                                                px-3 py-1 text-sm rounded-full border 
                                                ${
                                                    modelData.tags.includes(tag)
                                                        ? "bg-accent text-white border-accent"
                                                        : "bg-bg-surface text-txt-secondary border-br-primary hover:bg-accent hover:text-white"
                                                }
                                            `}
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                                <input
                                    type="text"
                                    readOnly
                                    value={modelData.tags.join(", ")}
                                    className="w-full px-4 py-2 text-sm border border-br-primary bg-bg-primary rounded"
                                />
                            </div>

                            {/* Model File Input */}
                            <div
                                className="border-2 border-dashed border-br-primary rounded p-4 text-center"
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                            >
                                {modelData.file ? (
                                    <p className="text-sm text-txt-secondary">
                                        Selected file:{" "}
                                        <span className="font-semibold">
                                            {modelData.file.name}
                                        </span>
                                    </p>
                                ) : (
                                    <>
                                        <p className="text-sm text-txt-secondary">
                                            Drag & drop .stl/.obj or click to choose
                                        </p>
                                        <label className="inline-block mt-2 bg-btn-primary text-white px-4 py-2 rounded cursor-pointer text-sm">
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

                            {/* Render Images */}
                            <div className="border-2 border-dashed border-br-primary rounded p-4 text-center">
                                {modelData.renderFiles.length > 0 ? (
                                    <div>
                                        <p className="text-sm">
                                            {modelData.renderFiles.length} file(s)
                                            selected
                                        </p>
                                        <div className="flex gap-2 mt-2 overflow-x-auto">
                                            {modelData.renderPreviewUrls.map(
                                                (url, index) => (
                                                    <div
                                                        key={index}
                                                        className={`border-4 cursor-pointer 
                                                        ${
                                                            modelData.selectedRenderIndex ===
                                                            index
                                                                ? "border-accent"
                                                                : "border-transparent hover:border-accent"
                                                        }
                                                    `}
                                                        onClick={() =>
                                                            setModelData((prev) => ({
                                                                ...prev,
                                                                selectedRenderIndex:
                                                                    index,
                                                            }))
                                                        }
                                                    >
                                                        <img
                                                            src={url}
                                                            alt={`Render ${index + 1}`}
                                                            className="w-16 h-16 object-fit"
                                                        />
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-sm">
                                            Upload additional render images (JPEG/PNG)
                                        </p>
                                        <label className="inline-block mt-2 bg-btn-primary text-white px-4 py-2 rounded cursor-pointer text-sm">
                                            Choose Images
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

                            {/* Convert & Publish Buttons */}
                            <div className="flex flex-col space-y-2">
                                <button
                                    type="button"
                                    disabled={!modelData.file || isConverting}
                                    onClick={handleConvertPreview}
                                    className="w-full bg-blue-600 text-white py-2 rounded-md disabled:opacity-50 text-sm font-medium"
                                >
                                    {isConverting ? "Converting..." : "Convert & Preview"}
                                </button>

                                {isUploading && (
                                    <div className="w-full bg-gray-300 rounded-md h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-md"
                                            style={{ width: `${uploadProgress}%` }}
                                        />
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isUploading || isConverting}
                                    className="w-full bg-btn-primary text-white py-2 rounded-md disabled:opacity-50 text-sm font-medium"
                                >
                                    {isUploading ? "Publishing..." : "Publish Model"}
                                </button>
                            </div>
                        </div>

                        {/* Right column: Previews */}
                        <div className="space-y-4">
                            <h3 className="text-center font-semibold">
                                3D Model Preview
                            </h3>
                            <div className="border rounded-md w-full h-[300px] flex items-center justify-center bg-bg-secondary">
                                {modelData.convertedUrl ? (
                                    <model-viewer
                                        src={modelData.convertedUrl}
                                        camera-controls
                                        auto-rotate
                                        crossOrigin="anonymous"
                                        className="w-full h-full"
                                    />
                                ) : (
                                    <p className="text-sm text-txt-secondary">
                                        No 3D preview
                                    </p>
                                )}
                            </div>

                            <h3 className="text-center font-semibold">Render Preview</h3>
                            <div className="border rounded-md w-full h-[300px] flex items-center justify-center bg-bg-secondary">
                                {modelData.renderPreviewUrls.length > 0 ? (
                                    <img
                                        src={
                                            modelData.renderPreviewUrls[
                                                modelData.selectedRenderIndex
                                            ]
                                        }
                                        alt="Render Preview"
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <p className="text-sm text-txt-secondary">
                                        No render preview
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};
