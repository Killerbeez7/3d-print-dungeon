import { useState, useEffect } from "react";

import { FaRegTrashAlt } from "react-icons/fa";

interface ClearAllConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  notificationCount: number;
}

export function ClearAllConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  notificationCount,
}: ClearAllConfirmModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isDeleting) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isDeleting, onClose]);

  const handleConfirm = async () => {
    if (isDeleting) {
      return;
    }

    setIsDeleting(true);

    try {
      await onConfirm();
      onClose();
    } catch {
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="clear-notifications-title"
        aria-describedby="clear-notifications-description"
        className="w-full max-w-md rounded-xl border border-br-primary bg-bg-secondary shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-br-secondary p-6">
          <h2
            id="clear-notifications-title"
            className="text-xl font-semibold text-txt-primary"
          >
            Clear Notifications
          </h2>
        </div>

        <div className="p-6">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              <FaRegTrashAlt
                className="h-8 w-8 text-red-600 dark:text-red-400"
                aria-hidden="true"
              />
            </div>

            <h3 className="mb-2 text-lg font-medium text-txt-primary">Are you sure?</h3>

            <p
              id="clear-notifications-description"
              className="text-sm leading-relaxed text-txt-secondary"
            >
              You&apos;re about to permanently delete{" "}
              <span className="font-semibold text-txt-primary">
                {notificationCount} notification
                {notificationCount !== 1 ? "s" : ""}
              </span>
              . This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="border-t border-br-secondary bg-bg-primary p-6">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => void handleConfirm()}
              disabled={isDeleting}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <span
                    className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                    aria-hidden="true"
                  />
                  Deleting...
                </>
              ) : (
                <>
                  <FaRegTrashAlt className="h-4 w-4" aria-hidden="true" />
                  Clear All
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 rounded-lg border border-br-secondary px-4 py-2.5 font-medium text-txt-secondary transition-colors hover:border-br-primary hover:text-txt-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
