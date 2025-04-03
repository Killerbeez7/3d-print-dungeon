import { useState } from "react";
import { useModelUpload } from "../../../contexts/modelUploadContext";
import { TiDelete } from "react-icons/ti";

export const ModelInfoStep = () => {
    const { modelData, setModelData } = useModelUpload();
    const [newTag, setNewTag] = useState("");

    const handleTagInputChange = (e) => setNewTag(e.target.value);

    const handleTagAdd = (e) => {
        if (e.key === "Enter" && newTag.trim() !== "" && !modelData.tags.includes(newTag.trim())) {
            setModelData((prev) => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
            setNewTag("");
        }
    };

    const handleTagRemove = (tagToRemove) => {
        setModelData((prev) => ({ ...prev, tags: prev.tags.filter((tag) => tag !== tagToRemove) }));
    };

    const handleModelDataChange = (e) => {
        const { name, value } = e.target;
        setModelData((prev) => ({ ...prev, [name]: value }));
    };

    // Handle Cover Image Upload
    const handleCoverImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file || !file.type.startsWith("image/")) return;

        const previewUrl = URL.createObjectURL(file);

        setModelData((prev) => ({
            ...prev,
            renderFiles: [file, ...prev.renderFiles.filter((_, i) => i !== 0)], // Ensure cover is first
            renderPreviewUrls: [previewUrl, ...prev.renderPreviewUrls.filter((_, i) => i !== 0)], // Ensure preview is first
        }));
    };

    // Handle Additional Images Upload
    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files).filter(file => file.type.startsWith("image/"));
        if (files.length === 0) return;

        const imagePreviews = files.map(file => URL.createObjectURL(file));

        setModelData((prev) => ({
            ...prev,
            renderFiles: [prev.renderFiles[0], ...prev.renderFiles.slice(1), ...files], // Keep cover first, add new images
            renderPreviewUrls: [prev.renderPreviewUrls[0], ...prev.renderPreviewUrls.slice(1), ...imagePreviews], // Keep preview first
        }));
    };

    // Remove Image (including cover)
    const handleRemoveImage = (index) => {
        setModelData((prev) => ({
            ...prev,
            renderFiles: prev.renderFiles.filter((_, i) => i !== index),
            renderPreviewUrls: prev.renderPreviewUrls.filter((_, i) => i !== index),
        }));
    };

    return (
        <section className="flex flex-col gap-2">
            <section className="bg-bg-secondary rounded-md py-4 px-8">
                <h4 className="text-xl font-semibold mb-4">Enter Model Information</h4>
                <form className="space-y-4">
                    <div>
                        <label className="block text-txt-secondary font-semibold">Model Name</label>
                        <input
                            type="text"
                            name="name"
                            value={modelData.name}
                            onChange={handleModelDataChange}
                            className="w-full p-2 border rounded-md"
                            placeholder="Enter model name"
                        />
                    </div>

                    <div>
                        <label className="block text-txt-secondary font-semibold">Category</label>
                        <input
                            name="category"
                            value={modelData.category}
                            onChange={handleModelDataChange}
                            className="w-full p-2 border rounded-md"
                            placeholder="Enter category"
                        />
                    </div>

                    <div>
                        <label className="block text-txt-secondary font-semibold">Description</label>
                        <textarea
                            name="description"
                            value={modelData.description}
                            onChange={handleModelDataChange}
                            className="w-full p-2 border rounded-md"
                            placeholder="Enter model description"
                        />
                    </div>

                    {/* Tags Section */}
                    <div className="border rounded p-4">
                        <h4 className="font-semibold mb-2">Add Tags</h4>
                        <input
                            type="text"
                            value={newTag}
                            onChange={handleTagInputChange}
                            onKeyDown={handleTagAdd}
                            placeholder="Press enter to add tags"
                            className="w-full px-4 py-2 text-sm border rounded mb-2"
                        />
                        <div className="flex flex-wrap gap-2">
                            {modelData.tags.map((tag) => (
                                <div key={tag} className="flex items-center bg-accent text-white px-3 py-1 rounded-full">
                                    <span>{tag}</span>
                                    <button type="button" onClick={() => handleTagRemove(tag)} className="ml-2 text-white">
                                        <TiDelete size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Cover Image Section */}
                    <div className="border rounded p-4">
                        <h4 className="font-semibold mb-2">Cover Image</h4>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleCoverImageUpload}
                            className="w-full px-4 py-2 text-sm border rounded mb-2"
                        />
                        {modelData.renderPreviewUrls[0] && (
                            <div className="relative w-full max-w-xs mx-auto">
                                <img
                                    src={modelData.renderPreviewUrls[0]}
                                    alt="Cover Preview"
                                    className="w-full object-cover rounded-md shadow-md"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveImage(0)}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                                >
                                    <TiDelete size={18} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Additional Images Section */}
                    <div className="border rounded p-4">
                        <h4 className="font-semibold mb-2">Upload Additional Images</h4>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="w-full px-4 py-2 text-sm border rounded mb-2"
                        />
                        <div className="flex flex-wrap gap-2">
                            {modelData.renderPreviewUrls.slice(1).map((url, index) => (
                                <div key={index + 1} className="relative">
                                    <img src={url} alt={`Preview ${index + 1}`} className="w-24 h-24 object-cover rounded-md" />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveImage(index + 1)}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                                    >
                                        <TiDelete size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </form>
            </section>
        </section>
    );
};
