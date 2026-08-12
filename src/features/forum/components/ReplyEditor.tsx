import { useState, type ChangeEvent, type FormEvent } from "react";

import { FaReply, FaTimes } from "react-icons/fa";

import { useCreateReply, useUpdateReply } from "../hooks";

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
  const [validationError, setValidationError] = useState<string | null>(null);

  const {
    mutateAsync: createReply,
    isPending: isCreating,
    error: createError,
  } = useCreateReply();

  const {
    mutateAsync: updateReply,
    isPending: isUpdating,
    error: updateError,
  } = useUpdateReply();

  const isPending = isCreating || isUpdating;
  const mutationError = isEdit ? updateError : createError;

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setContent(event.target.value);

    if (validationError) {
      setValidationError(null);
    }
  };

  const validateContent = (): boolean => {
    const trimmedContent = content.trim();

    if (!trimmedContent) {
      setValidationError("Reply content is required");

      return false;
    }

    if (trimmedContent.length < 5) {
      setValidationError("Reply must be at least 5 characters");

      return false;
    }

    return true;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    if (!validateContent()) {
      return;
    }

    const trimmedContent = content.trim();

    try {
      if (isEdit) {
        if (!replyId) {
          setValidationError("Reply ID is required");

          return;
        }

        await updateReply({
          replyId,
          threadId,
          data: {
            content: trimmedContent,
          },
        });
      } else {
        await createReply({
          threadId,
          content: trimmedContent,
        });
      }

      if (!isEdit) {
        setContent("");
      }

      onSuccess();
    } catch {
      // Mutation error is rendered below.
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <textarea
          value={content}
          onChange={handleChange}
          disabled={isPending}
          rows={5}
          className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
            validationError ? "border-red-500" : ""
          }`}
          placeholder="Write your reply here..."
        />

        {validationError && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationError}</p>
        )}

        {mutationError && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {mutationError.message}
          </p>
        )}

        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Basic formatting is supported: **bold**, *italic*, [link](url)
        </p>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <FaTimes className="mr-2 -ml-1" />
          Cancel
        </button>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
        >
          <FaReply className="mr-2 -ml-1" />

          {isPending ? "Submitting..." : isEdit ? "Update Reply" : "Post Reply"}
        </button>
      </div>
    </form>
  );
};
