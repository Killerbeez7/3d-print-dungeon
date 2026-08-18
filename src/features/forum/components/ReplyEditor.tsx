import { useState, type ChangeEvent, type FormEvent } from "react";
import { FaReply, FaTimes } from "react-icons/fa";

import { Button } from "@/components";

import { useCreateReply, useUpdateReply } from "../hooks";

export interface ReplyEditorProps {
  threadId: string;
  initialContent?: string;
  onSuccess: () => void;
  onCancel: () => void;
  isEdit?: boolean;
  replyId?: string | null;
}

export function ReplyEditor({
  threadId,
  initialContent = "",
  onSuccess,
  onCancel,
  isEdit = false,
  replyId = null,
}: ReplyEditorProps) {
  const [content, setContent] = useState(initialContent);
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

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>): void => {
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
          placeholder="Write your reply here..."
          aria-invalid={Boolean(validationError || mutationError)}
          className={`block w-full resize-y rounded-lg border bg-surface-card px-4 py-3 text-sm leading-relaxed text-txt-primary shadow-sm outline-none transition placeholder:text-txt-muted focus:border-focus focus:ring-2 focus:ring-focus/15 disabled:cursor-not-allowed disabled:opacity-60 ${
            validationError || mutationError ? "border-error" : "border-br-secondary"
          }`}
        />

        {validationError && <p className="mt-2 text-sm text-error">{validationError}</p>}

        {mutationError && (
          <p className="mt-2 text-sm text-error">{mutationError.message}</p>
        )}

        <p className="mt-2 text-xs text-txt-muted">
          Basic formatting is supported: **bold**, *italic*, [link](url)
        </p>
      </div>

      <div className="flex flex-wrap justify-end gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isPending}
          leftIcon={<FaTimes size={12} aria-hidden="true" />}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          disabled={isPending}
          isLoading={isPending}
          leftIcon={<FaReply size={12} aria-hidden="true" />}
        >
          {isEdit ? "Update Reply" : "Post Reply"}
        </Button>
      </div>
    </form>
  );
}
