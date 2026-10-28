import { useState, useEffect } from "react";

import FocusLock from "react-focus-lock";
import { Trash2 } from "lucide-react";

import { Button } from "@/components";

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
    <div className="fixed inset-0 z-[9999] flex items-end justify-center md:items-center md:p-6">
      <div
        className="absolute inset-0 animate-[fade_0.2s_ease] bg-surface-overlay backdrop-blur-sm"
        onClick={isDeleting ? undefined : onClose}
        aria-hidden="true"
      />
      <FocusLock returnFocus className="contents">
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="clear-notifications-title"
          aria-describedby="clear-notifications-description"
          className="auth-panel relative w-full max-w-md overflow-hidden rounded-t-2xl border border-br-secondary bg-surface-card p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-popover md:rounded-xl"
        >
          <span className="chamfer flex size-12 items-center justify-center bg-error/15 text-error [--cut:9px]">
            <Trash2 className="size-5" aria-hidden="true" />
          </span>
          <h2 id="clear-notifications-title" className="mt-4 text-xl font-bold">
            Clear all notifications?
          </h2>
          <p id="clear-notifications-description" className="mt-2 text-sm leading-relaxed text-txt-secondary">
            This permanently deletes{" "}
            <span className="font-semibold text-txt-primary">
              {notificationCount} notification{notificationCount !== 1 ? "s" : ""}
            </span>
            . It can&apos;t be undone.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={onClose} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => void handleConfirm()} isLoading={isDeleting}>
              {isDeleting ? "Deleting…" : "Clear all"}
            </Button>
          </div>
        </div>
      </FocusLock>
    </div>
  );
}
