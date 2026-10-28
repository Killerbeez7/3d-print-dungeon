import { useId, useState, type ChangeEvent, type FormEvent } from "react";
import { Send } from "lucide-react";

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
  const fieldId = useId();
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

  const errorText = validationError ?? mutationError?.message;

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label htmlFor={fieldId} className="sr-only">
        Reply
      </label>
      <textarea
        id={fieldId}
        value={content}
        onChange={handleChange}
        disabled={isPending}
        rows={5}
        placeholder="Write your reply"
        aria-invalid={Boolean(errorText)}
        aria-describedby={errorText ? `${fieldId}-error` : undefined}
        className="field resize-y py-3 leading-relaxed"
      />

      {errorText && (
        <p id={`${fieldId}-error`} className="text-sm text-error">
          {errorText}
        </p>
      )}

      <div className="flex flex-wrap justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isPending}>
          Cancel
        </Button>
        <Button
          type="submit"
          isLoading={isPending}
          leftIcon={<Send className="size-4" aria-hidden="true" />}
        >
          {isEdit ? "Save reply" : "Post reply"}
        </Button>
      </div>
    </form>
  );
}
