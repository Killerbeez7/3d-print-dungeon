import { useState, ChangeEvent, KeyboardEvent, FC } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchCategories, type Category } from "@/features/search-filters/services/categoryService";
import { TiDelete } from "react-icons/ti";
import { ImagesUpload } from "./ImagesUpload";
import { FormLabel, H3 } from "@/components/index";
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
                        <FormLabel as="div" className="block mb-1">
                            Model Name <span className="text-error">*</span>
                        </FormLabel>
                        <input
                            type="text"
                            name="name"
                            value={
                                typeof modelData.name === "string" ? modelData.name : ""
                            }
                            onChange={handleModelDataChange}
                            className="w-full p-3 border border-br-secondary rounded-md bg-bg-surface text-txt-primary placeholder:text-txt-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                            placeholder="Enter model name"
                            required
                        />
                    </div>

                    {/* Category multi-select */}
                    <div>
                        <FormLabel as="div" className="block mb-1">
                            Categories <span className="text-error">*</span>
                        </FormLabel>
                        <select
                            multiple
                            value={modelData.categoryIds ?? []}
                            onChange={(e) => {
                                const vals = Array.from(e.target.selectedOptions).map((o) => o.value);
                                setModelData((prev) => ({ ...prev, categoryIds: vals }));
                            }}
                            className="w-full p-3 border border-br-secondary rounded-md bg-bg-surface h-40 text-txt-primary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                        >
                            {categories?.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <FormLabel as="div" className="block mb-1">
                            Description <span className="text-error">*</span>
                        </FormLabel>
                        <textarea
                            name="description"
                            value={
                                typeof modelData.description === "string"
                                    ? modelData.description
                                    : ""
                            }
                            onChange={handleModelDataChange}
                            className="w-full p-3 border border-br-secondary rounded-md bg-bg-surface text-txt-primary placeholder:text-txt-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
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
                        <FormLabel as="div">Model is AI-generated</FormLabel>
                    </div>

                    {/* Tags Section */}
                    <div className="border border-br-secondary rounded-lg p-4 bg-bg-secondary">
                        <H3 size="base" className="mb-3">Add Tags</H3>
                        <input
                            type="text"
                            value={newTag}
                            onChange={handleTagInputChange}
                            onKeyDown={handleTagAdd}
                            placeholder="Press enter to add tags"
                            className="w-full px-4 py-2 text-sm border border-br-secondary rounded-md mb-3 bg-bg-surface text-txt-primary placeholder:text-txt-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                        />
                        <div className="flex flex-wrap gap-2">
                            {Array.isArray(modelData.tags) &&
                                modelData.tags.map((tag: string) => (
                                    <div
                                        key={tag}
                                        className="bg-accent text-white flex items-center px-3 py-1 rounded-full"
                                    >
                                        <span className="text-sm">{tag}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleTagRemove(tag)}
                                            className="ml-2 text-white hover:text-red-200 transition-colors"
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
