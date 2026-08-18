import { useState, type ChangeEvent, type FormEvent } from "react";
import { FaSave, FaTimes } from "react-icons/fa";

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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-txt-primary">
          Thread Title
        </label>

        <input
          id="title"
          name="title"
          type="text"
          value={formData.title}
          onChange={handleChange}
          disabled={isLoading}
          placeholder="Enter a descriptive title"
          aria-invalid={Boolean(errors.title)}
          className={`mt-2 block w-full rounded-lg border bg-surface-card px-3 py-2.5 text-sm text-txt-primary shadow-sm outline-none transition placeholder:text-txt-muted focus:border-focus focus:ring-2 focus:ring-focus/15 disabled:cursor-not-allowed disabled:opacity-60 ${
            errors.title ? "border-error" : "border-br-secondary"
          }`}
        />

        {errors.title && <p className="mt-2 text-sm text-error">{errors.title}</p>}
      </div>

      {/* Category */}
      <div>
        <label
          htmlFor="categoryId"
          className="block text-sm font-medium text-txt-primary"
        >
          Category
        </label>

        <select
          id="categoryId"
          name="categoryId"
          value={formData.categoryId}
          onChange={handleChange}
          disabled={isLoading}
          aria-invalid={Boolean(errors.categoryId)}
          className={`mt-2 block w-full rounded-lg border bg-surface-card px-3 py-2.5 text-sm text-txt-primary shadow-sm outline-none transition focus:border-focus focus:ring-2 focus:ring-focus/15 disabled:cursor-not-allowed disabled:opacity-60 ${
            errors.categoryId ? "border-error" : "border-br-secondary"
          }`}
        >
          <option value="">Select a category</option>

          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        {errors.categoryId && (
          <p className="mt-2 text-sm text-error">{errors.categoryId}</p>
        )}
      </div>

      {/* Tags */}
      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-txt-primary">
          Tags
        </label>

        <input
          id="tags"
          name="tags"
          type="text"
          value={tags}
          onChange={handleTagsChange}
          disabled={isLoading}
          placeholder="e.g. question, help, tutorial"
          className="mt-2 block w-full rounded-lg border border-br-secondary bg-surface-card px-3 py-2.5 text-sm text-txt-primary shadow-sm outline-none transition placeholder:text-txt-muted focus:border-focus focus:ring-2 focus:ring-focus/15 disabled:cursor-not-allowed disabled:opacity-60"
        />

        <p className="mt-2 text-xs text-txt-muted">Separate tags with commas.</p>
      </div>

      {/* Content */}
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-txt-primary">
          Content
        </label>

        <textarea
          id="content"
          name="content"
          value={formData.content}
          onChange={handleChange}
          disabled={isLoading}
          rows={10}
          placeholder="Write your thread content here..."
          aria-invalid={Boolean(errors.content)}
          className={`mt-2 block w-full resize-y rounded-lg border bg-surface-card px-4 py-3 text-sm leading-relaxed text-txt-primary shadow-sm outline-none transition placeholder:text-txt-muted focus:border-focus focus:ring-2 focus:ring-focus/15 disabled:cursor-not-allowed disabled:opacity-60 ${
            errors.content ? "border-error" : "border-br-secondary"
          }`}
        />

        {errors.content && <p className="mt-2 text-sm text-error">{errors.content}</p>}

        <p className="mt-2 text-xs text-txt-muted">
          Basic formatting is supported: **bold**, *italic*, [link](url)
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap justify-end gap-3 border-t border-br-subtle pt-5">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading}
            leftIcon={<FaTimes size={12} aria-hidden="true" />}
          >
            Cancel
          </Button>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          isLoading={isLoading}
          leftIcon={<FaSave size={12} aria-hidden="true" />}
        >
          {isEdit ? "Save Changes" : "Create Thread"}
        </Button>
      </div>
    </form>
  );
}
