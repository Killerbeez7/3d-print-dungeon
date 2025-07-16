import { useState, ChangeEvent, FormEvent } from "react";
import { useForum } from "@/features/forum/hooks/useForum";
import { FaReply, FaTimes } from "react-icons/fa";

export interface ReplyEditorProps {
    threadId: string;
    initialContent?: string;
    onSuccess: () => void;
    onCancel: () => void;
    isEdit?: boolean;
    replyId?: string | null;
}

export const ReplyEditor = ({
    threadId,
    initialContent = "",
    onSuccess,
    onCancel,
    isEdit = false,
    replyId = null,
}: ReplyEditorProps) => {
    const [content, setContent] = useState<string>(initialContent);
    const [error, setError] = useState<string | null>(null);
    const { addReply, updateReply, loading } = useForum();

    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value);
        if (error) setError(null);
    };

    const validateContent = (): boolean => {
        if (!content.trim()) {
            setError("Reply content is required");
            return false;
        }
        if (content.length < 5) {
            setError("Reply must be at least 5 characters");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!validateContent()) {
            return;
        }
        try {
            if (isEdit && replyId) {
                await updateReply(replyId, threadId, content);
            } else {
                await addReply(threadId, content);
            }
            onSuccess();
            if (!isEdit) {
                setContent("");
            }
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            setError(msg);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <textarea
                    value={content}
                    onChange={handleChange}
                    disabled={loading}
                    rows={5}
                    className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                        error ? "border-red-500" : ""
                    }`}
                    placeholder="Write your reply here..."
                />
                {error && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
                )}
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Basic formatting is supported: **bold**, *italic*, [link](url)
                </p>
            </div>
            <div className="flex justify-end gap-3">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <FaTimes className="mr-2 -ml-1" />
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
                >
                    <FaReply className="mr-2 -ml-1" />
                    {loading ? "Submitting..." : isEdit ? "Update Reply" : "Post Reply"}
                </button>
            </div>
        </form>
    );
}
