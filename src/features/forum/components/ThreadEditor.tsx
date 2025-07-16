import { useState, useEffect } from "react";
import { FaSave, FaTimes } from "react-icons/fa";
import type { ForumCategory } from "@/features/forum/types/forum";
import type { FC } from "react";

interface ThreadEditorProps {
    initialData: { title: string; content: string; categoryId: string; tags?: string[] };
    categories: ForumCategory[];
    onSubmit: (data: { title: string; content: string; categoryId: string; tags?: string[] }) => void;
    onCancel?: () => void;
    isLoading?: boolean;
    isEdit?: boolean;
}

export const ThreadEditor: FC<ThreadEditorProps> = ({
    initialData = { title: "", content: "", categoryId: "" },
    categories = [],
    onSubmit,
    onCancel,
    isLoading = false,
    isEdit = false,
}) => {
    const [formData, setFormData] = useState(initialData);
    const [errors, setErrors] = useState<Record<string, string | null>>({});
    const [tags, setTags] = useState(initialData.tags?.join(", ") || "");

    useEffect(() => {
        setFormData(initialData);
        setTags(initialData.tags?.join(", ") || "");
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Clear error when field is edited
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: null }));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.title.trim()) {
            newErrors.title = "Title is required";
        } else if (formData.title.length < 5) {
            newErrors.title = "Title must be at least 5 characters";
        }

        if (!formData.content.trim()) {
            newErrors.content = "Content is required";
        } else if (formData.content.length < 10) {
            newErrors.content = "Content must be at least 10 characters";
        }

        if (!formData.categoryId) {
            newErrors.categoryId = "Category is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        // Process tags if present
        let processedData = { ...formData };
        if (tags.trim()) {
            processedData.tags = tags
                .split(",")
                .map((tag) => tag.trim())
                .filter((tag) => tag.length > 0);
        }

        onSubmit(processedData);
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
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.title}
                    </p>
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
                    disabled={isLoading || isEdit}
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
                    onChange={(e) => setTags(e.target.value)}
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
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.content}
                    </p>
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
