import { useState } from "react";
import { TiDelete } from "react-icons/ti";
import PropTypes from "prop-types";
// components
import { ImagesUpload } from "./ImagesUpload";

export function InfoForm({ modelData, setModelData }) {
    const [newTag, setNewTag] = useState("");

    const handleTagInputChange = (e) => setNewTag(e.target.value);

    const handleTagAdd = (e) => {
        if (
            e.key === "Enter" &&
            newTag.trim() !== "" &&
            !modelData.tags.includes(newTag.trim())
        ) {
            setModelData((prev) => ({
                ...prev,
                tags: [...prev.tags, newTag.trim()],
            }));
            setNewTag("");
        }
    };

    const handleTagRemove = (tagToRemove) => {
        setModelData((prev) => ({
            ...prev,
            tags: prev.tags.filter((tag) => tag !== tagToRemove),
        }));
    };

    const handleModelDataChange = (e) => {
        const { name, value } = e.target;
        setModelData((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <section className="flex flex-col gap-2">
            <section className="rounded-md py-4 px-8">
                <div>
                    {/* Image Upload Section */}
                    <ImagesUpload modelData={modelData} setModelData={setModelData} />
                </div>

                <form className="space-y-4">
                    <div>
                        <label className="block text-txt-secondary font-semibold">
                            Model Name <span className="text-error">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={modelData.name}
                            onChange={handleModelDataChange}
                            className="w-full p-2 border rounded-md bg-bg-surface"
                            placeholder="Enter model name"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-txt-secondary font-semibold">
                            Category <span className="text-error">*</span>
                        </label>
                        <input
                            name="category"
                            value={modelData.category}
                            onChange={handleModelDataChange}
                            className="w-full p-2 border rounded-md bg-bg-surface"
                            placeholder="Enter category"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-txt-secondary font-semibold">
                            Description <span className="text-error">*</span>
                        </label>
                        <textarea
                            name="description"
                            value={modelData.description}
                            onChange={handleModelDataChange}
                            className="w-full p-2 border rounded-md bg-bg-surface"
                            placeholder="Enter model description"
                            required
                        />
                    </div>

                    {/* Tags Section */}
                    <div className="border rounded p-4">
                        <h4 className="font-semibold mb-2 text-txt-primary">Add Tags</h4>
                        <input
                            type="text"
                            value={newTag}
                            onChange={handleTagInputChange}
                            onKeyDown={handleTagAdd}
                            placeholder="Press enter to add tags"
                            className="w-full px-4 py-2 text-sm border rounded mb-2 bg-bg-surface"
                        />
                        <div className="flex flex-wrap gap-2">
                            {modelData.tags.map((tag) => (
                                <div
                                    key={tag}
                                    className="flex items-center bg-accent text-white px-3 py-1 rounded-full"
                                >
                                    <span>{tag}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleTagRemove(tag)}
                                        className="ml-2 text-white"
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
}

InfoForm.propTypes = {
    modelData: PropTypes.object.isRequired,
    setModelData: PropTypes.func.isRequired,
};

InfoForm.propTypes = {
    modelData: PropTypes.object.isRequired,
    setModelData: PropTypes.func.isRequired,
};
