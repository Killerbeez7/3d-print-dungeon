import { useState, ChangeEvent, KeyboardEvent, FC } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchCategories, type Category } from "@/features/search-filters/services/categoryService";
import { TiDelete } from "react-icons/ti";
import { ImagesUpload } from "./ImagesUpload";
import type { ModelData } from "@/features/models/types/model";

interface InfoFormProps {
    modelData: ModelData;
    setModelData: React.Dispatch<React.SetStateAction<ModelData>>;
}

export const InfoForm: FC<InfoFormProps> = ({ modelData, setModelData }) => {
    const [newTag, setNewTag] = useState<string>("");

    const { data: categories } = useQuery<Category[]>({
        queryKey: ["categories"],
        queryFn: fetchCategories,
    });

    const handleTagInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
        setNewTag(e.target.value);
    };

    const handleTagAdd = (e: KeyboardEvent<HTMLInputElement>): void => {
        if (
            e.key === "Enter" &&
            newTag.trim() !== "" &&
            Array.isArray(modelData.tags) &&
            !modelData.tags.includes(newTag.trim())
        ) {
            setModelData((prev) => ({
                ...prev,
                tags: [...(Array.isArray(prev.tags) ? prev.tags : []), newTag.trim()],
            }));
            setNewTag("");
        }
    };

    const handleTagRemove = (tagToRemove: string): void => {
        setModelData((prev) => ({
            ...prev,
            tags: (Array.isArray(prev.tags) ? prev.tags : []).filter(
                (tag) => tag !== tagToRemove
            ),
        }));
    };

    const handleModelDataChange = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ): void => {
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
                            value={
                                typeof modelData.name === "string" ? modelData.name : ""
                            }
                            onChange={handleModelDataChange}
                            className="w-full p-2 border rounded-md bg-bg-surface"
                            placeholder="Enter model name"
                            required
                        />
                    </div>

                    {/* Category multi-select */}
                    <div>
                        <label className="block text-txt-secondary font-semibold mb-1">
                            Categories <span className="text-error">*</span>
                        </label>
                        <select
                            multiple
                            value={modelData.categoryIds ?? []}
                            onChange={(e) => {
                                const vals = Array.from(e.target.selectedOptions).map((o) => o.value);
                                setModelData((prev) => ({ ...prev, categoryIds: vals }));
                            }}
                            className="w-full p-2 border rounded-md bg-bg-surface h-40"
                        >
                            {categories?.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-txt-secondary font-semibold">
                            Description <span className="text-error">*</span>
                        </label>
                        <textarea
                            name="description"
                            value={
                                typeof modelData.description === "string"
                                    ? modelData.description
                                    : ""
                            }
                            onChange={handleModelDataChange}
                            className="w-full p-2 border rounded-md bg-bg-surface"
                            placeholder="Enter model description"
                            required
                        />
                    </div>

                    {/* AI Checkbox */}
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={Boolean(modelData.isAI)}
                            onChange={e =>
                                setModelData(prev => ({ ...prev, isAI: e.target.checked }))
                            }
                            className="accent-accent h-4 w-4"
                        />
                        <label className="text-txt-secondary">Model is AI-generated</label>
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
                            {Array.isArray(modelData.tags) &&
                                modelData.tags.map((tag: string) => (
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
};
