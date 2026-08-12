import { useState, type ChangeEvent, type FormEvent } from "react";

import { FaSave, FaTimes } from "react-icons/fa";

import type { CreateThreadInput, ForumCategory } from "../types/forum";

interface ThreadEditorProps {
  initialData: CreateThreadInput;
  categories: ForumCategory[];
  onSubmit: (data: CreateThreadInput) => void | Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  isEdit?: boolean;
}

export const ThreadEditor = ({
  initialData,
  categories,
  onSubmit,
  onCancel,
  isLoading = false,
  isEdit = false,
}: ThreadEditorProps) => {
  const [formData, setFormData] = useState<CreateThreadInput>(initialData);

  const [tags, setTags] = useState<string>(initialData.tags?.join(", ") ?? "");

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
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

  const handleTagsChange = (event: ChangeEvent<HTMLInputElement>) => {
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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
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
        <label
          htmlFor="title"
          className="block text-sm font-medium text-[var(--txt-primary)]"
        >
          Thread Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          disabled={isLoading}
          className={`mt-1 block w-full rounded-lg border-[var(--br-secondary)] bg-[var(--bg-surface)] text-[var(--txt-primary)] shadow-sm focus:border-[var(--accent)] focus:ring-[var(--accent)] ${
            errors.title ? "border-red-500" : ""
          }`}
          placeholder="Enter a descriptive title"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>
        )}
      </div>

      {/* Category Selection */}
      <div>
        <label
          htmlFor="categoryId"
          className="block text-sm font-medium text-[var(--txt-primary)]"
        >
          Category
        </label>
        <select
          id="categoryId"
          name="categoryId"
          value={formData.categoryId}
          onChange={handleChange}
          disabled={isLoading}
          className={`mt-1 block w-full rounded-lg border-[var(--br-secondary)] bg-[var(--bg-surface)] text-[var(--txt-primary)] shadow-sm focus:border-[var(--accent)] focus:ring-[var(--accent)] ${
            errors.categoryId ? "border-red-500" : ""
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
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.categoryId}
          </p>
        )}
      </div>

      {/* Tags */}
      <div>
        <label
          htmlFor="tags"
          className="block text-sm font-medium text-[var(--txt-primary)]"
        >
          Tags (comma separated)
        </label>
        <input
          type="text"
          id="tags"
          name="tags"
          value={tags}
          onChange={handleTagsChange}
          disabled={isLoading}
          className="mt-1 block w-full rounded-lg border-[var(--br-secondary)] bg-[var(--bg-surface)] text-[var(--txt-primary)] shadow-sm focus:border-[var(--accent)] focus:ring-[var(--accent)]"
          placeholder="e.g., question, help, tutorial"
        />
      </div>

      {/* Content */}
      <div>
        <label
          htmlFor="content"
          className="block text-sm font-medium text-[var(--txt-primary)]"
        >
          Content
        </label>
        <textarea
          id="content"
          name="content"
          value={formData.content}
          onChange={handleChange}
          disabled={isLoading}
          rows={10}
          className={`mt-1 block w-full rounded-lg border-[var(--br-secondary)] bg-[var(--bg-surface)] text-[var(--txt-primary)] shadow-sm focus:border-[var(--accent)] focus:ring-[var(--accent)] ${
            errors.content ? "border-red-500" : ""
          }`}
          placeholder="Write your thread content here..."
        />
        {errors.content && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.content}</p>
        )}
        <p className="mt-1 text-sm text-[var(--txt-muted)]">
          Basic formatting is supported: **bold**, *italic*, [link](url)
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 rounded-lg font-semibold border border-[var(--br-secondary)] bg-[var(--bg-surface)] text-[var(--txt-primary)] hover:bg-[var(--bg-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          >
            <FaTimes className="mr-2 -ml-1" />
            Cancel
          </button>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center px-4 py-2 rounded-lg font-semibold bg-[var(--accent)] text-[var(--txt-highlight)] hover:bg-[var(--accent-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
        >
          <FaSave className="mr-2 -ml-1" />
          {isEdit ? "Save Changes" : "Create Thread"}
        </button>
      </div>
    </form>
  );
};
