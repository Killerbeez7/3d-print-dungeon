import { useState, ChangeEvent, KeyboardEvent, FC } from "react";
import { Sparkles, X } from "lucide-react";

import { ImagesUpload } from "./ImagesUpload";
import { MODEL_CATEGORIES } from "@/features/models/constants/modelCategories";

import type { ModelUploadData } from "@/features/models/types/model";

interface InfoFormProps {
  modelData: ModelUploadData;
  setModelData: React.Dispatch<React.SetStateAction<ModelUploadData>>;
}

export const InfoForm: FC<InfoFormProps> = ({ modelData, setModelData }) => {
  const [newTag, setNewTag] = useState<string>("");

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

  const toggleCategory = (categoryId: string): void => {
    setModelData((prev) => {
      const current = prev.categoryIds ?? [];
      return {
        ...prev,
        categoryIds: current.includes(categoryId)
          ? current.filter((id) => id !== categoryId)
          : [...current, categoryId],
      };
    });
  };

  const fieldClass =
    "w-full rounded-lg border border-br-input bg-page px-3 text-sm text-txt-primary placeholder:text-txt-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25";
  const labelClass = "mb-1.5 block text-sm font-medium text-txt-secondary";
  const selectedCategories = modelData.categoryIds ?? [];

  return (
    <section className="space-y-8">
      <ImagesUpload modelData={modelData} setModelData={setModelData} />

      <div className="space-y-6">
        <div>
          <label htmlFor="model-name" className={labelClass}>
            Model name <span className="text-error">*</span>
          </label>
          <input
            id="model-name"
            type="text"
            name="name"
            value={typeof modelData.name === "string" ? modelData.name : ""}
            onChange={handleModelDataChange}
            className={`${fieldClass} h-12 text-base`}
            placeholder="e.g. Golden Dragon"
            required
          />
        </div>

        <fieldset>
          <legend className={labelClass}>
            Categories <span className="text-error">*</span>
            <span className="ml-2 font-mono text-xs text-txt-muted">
              {selectedCategories.length} selected
            </span>
          </legend>
          <div className="flex flex-wrap gap-1.5">
            {MODEL_CATEGORIES.map((category) => {
              const isSelected = selectedCategories.includes(category.id);
              return (
                <button
                  key={category.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => toggleCategory(category.id)}
                  title={category.description}
                  className={`h-9 border px-3 text-sm font-medium transition-colors ${
                    isSelected
                      ? "border-accent bg-accent-soft text-txt-primary"
                      : "border-br-secondary text-txt-secondary hover:border-br-primary hover:text-txt-primary"
                  }`}
                >
                  {category.name}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div>
          <label htmlFor="model-description" className={labelClass}>
            Description <span className="text-error">*</span>
          </label>
          <textarea
            id="model-description"
            name="description"
            rows={5}
            value={typeof modelData.description === "string" ? modelData.description : ""}
            onChange={handleModelDataChange}
            className={`${fieldClass} py-3 leading-relaxed`}
            placeholder="Scale, supports, print settings, anything a printer should know"
            required
          />
        </div>

        <div>
          <label htmlFor="model-tags" className={labelClass}>
            Tags
          </label>
          <input
            id="model-tags"
            type="text"
            value={newTag}
            onChange={handleTagInputChange}
            onKeyDown={handleTagAdd}
            placeholder="Type a tag and press Enter"
            className={`${fieldClass} h-11`}
          />
          {Array.isArray(modelData.tags) && modelData.tags.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {modelData.tags.map((tag: string) => (
                <li
                  key={tag}
                  className="flex items-center gap-1 border border-br-secondary py-1 pl-2.5 pr-1 font-mono text-xs text-txt-secondary"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleTagRemove(tag)}
                    aria-label={`Remove tag ${tag}`}
                    className="flex size-5 items-center justify-center text-txt-muted transition-colors hover:text-error"
                  >
                    <X className="size-3.5" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-br-subtle bg-page p-4 transition-colors hover:border-br-primary">
          <input
            type="checkbox"
            checked={Boolean(modelData.isAI)}
            onChange={(e) => setModelData((prev) => ({ ...prev, isAI: e.target.checked }))}
            className="mt-0.5 size-4 accent-accent"
          />
          <span>
            <span className="flex items-center gap-1.5 text-sm font-medium text-txt-primary">
              <Sparkles className="size-4 text-accent" aria-hidden="true" />
              Made with AI
            </span>
            <span className="mt-0.5 block text-xs text-txt-muted">
              Tick this if AI tools generated the model or its renders. It&apos;s shown on the model
              page.
            </span>
          </span>
        </label>
      </div>
    </section>
  );
};
