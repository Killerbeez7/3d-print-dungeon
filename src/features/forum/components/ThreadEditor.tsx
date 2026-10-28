import { useState, type ChangeEvent, type FormEvent } from "react";
import { Check } from "lucide-react";

import { Button } from "@/components";

import type { CreateThreadInput, ForumCategory } from "../types/forum";

interface ThreadEditorProps {
  initialData: CreateThreadInput;
  categories: ForumCategory[];
  onSubmit: (data: CreateThreadInput) => void | Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  isEdit?: boolean;
}

export function ThreadEditor({
  initialData,
  categories,
  onSubmit,
  onCancel,
  isLoading = false,
  isEdit = false,
}: ThreadEditorProps) {
  const [formData, setFormData] = useState<CreateThreadInput>(initialData);

  const [tags, setTags] = useState(initialData.tags?.join(", ") ?? "");

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ): void => {
    const { name, value } = event.target;

    setFormData((current) => {
      return {
        ...current,
        [name]: value,
      };
    });

    if (errors[name]) {
      setErrors((current) => {
        const next = { ...current };

        delete next[name];

        return next;
      });
    }
  };

  const handleTagsChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setTags(event.target.value);
  };

  const validateForm = (): boolean => {
    const nextErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      nextErrors.title = "Title is required";
    } else if (formData.title.trim().length < 5) {
      nextErrors.title = "Title must be at least 5 characters";
    }

    if (!formData.content.trim()) {
      nextErrors.content = "Content is required";
    } else if (formData.content.trim().length < 10) {
      nextErrors.content = "Content must be at least 10 characters";
    }

    if (!formData.categoryId) {
      nextErrors.categoryId = "Category is required";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    const processedTags = tags
      .split(",")
      .map((tag) => {
        return tag.trim();
      })
      .filter((tag) => {
        return tag.length > 0;
      });

    const data: CreateThreadInput = {
      ...formData,
      title: formData.title.trim(),
      content: formData.content.trim(),
      tags: processedTags,
    };

    void onSubmit(data);
  };

  const labelClass = "mb-1.5 block text-sm font-medium text-txt-secondary";
  const errorText = (field: string) =>
    errors[field] && (
      <p id={`${field}-error`} className="mt-1.5 text-sm text-error">
        {errors[field]}
      </p>
    );
  const describedBy = (field: string) => (errors[field] ? `${field}-error` : undefined);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className={labelClass}>
          Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          value={formData.title}
          onChange={handleChange}
          disabled={isLoading}
          placeholder="Ask a question or name the topic"
          aria-invalid={Boolean(errors.title)}
          aria-describedby={describedBy("title")}
          className="field h-12 text-base"
        />
        {errorText("title")}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="categoryId" className={labelClass}>
            Category
          </label>
          <select
            id="categoryId"
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            disabled={isLoading}
            aria-invalid={Boolean(errors.categoryId)}
            aria-describedby={describedBy("categoryId")}
            className="field h-11"
          >
            <option value="">Choose a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errorText("categoryId")}
        </div>

        <div>
          <label htmlFor="tags" className={labelClass}>
            Tags <span className="font-normal text-txt-muted">(optional)</span>
          </label>
          <input
            id="tags"
            name="tags"
            type="text"
            value={tags}
            onChange={handleTagsChange}
            disabled={isLoading}
            placeholder="resin, supports, help"
            aria-describedby="tags-hint"
            className="field h-11"
          />
          <p id="tags-hint" className="mt-1.5 text-xs text-txt-muted">
            Separate tags with commas.
          </p>
        </div>
      </div>

      <div>
        <label htmlFor="content" className={labelClass}>
          Message
        </label>
        <textarea
          id="content"
          name="content"
          value={formData.content}
          onChange={handleChange}
          disabled={isLoading}
          rows={10}
          placeholder="Give enough detail for someone to help: printer, material, settings, photos of the problem."
          aria-invalid={Boolean(errors.content)}
          aria-describedby={describedBy("content")}
          className="field resize-y py-3 leading-relaxed"
        />
        {errorText("content")}
      </div>

      <div className="flex flex-wrap justify-end gap-2 border-t border-br-subtle pt-5">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          isLoading={isLoading}
          leftIcon={<Check className="size-4" aria-hidden="true" />}
        >
          {isEdit ? "Save changes" : "Post thread"}
        </Button>
      </div>
    </form>
  );
}
