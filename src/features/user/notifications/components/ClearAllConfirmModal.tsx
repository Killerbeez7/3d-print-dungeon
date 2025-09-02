import { useState } from "react";
import { Trash2, X } from "lucide-react";
import { H5 } from "@/components";

interface ClearAllConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isLoading?: boolean;
    notificationCount: number;
}

export function ClearAllConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    isLoading = false,
    notificationCount,
}: ClearAllConfirmModalProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleConfirm = async () => {
        setIsDeleting(true);
        try {
            await onConfirm();
            onClose();
        } catch (error) {
            console.error("Failed to clear notifications:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
            <div className="bg-bg-secondary rounded-xl shadow-2xl max-w-md w-full border border-br-primary">
                {/* Header */}
                <div className="p-6 border-b border-br-secondary">
                    <div className="flex items-center gap-3">
                        <div className="flex-1">
                            <H5 className="text-xl font-semibold text-txt-primary">
                                Clear Notifications
                            </H5>
                            {/* <p className="text-sm text-txt-secondary mt-1">
                                This action cannot be undone
                            </p> */}
                        </div>
                        <button
                            onClick={onClose}
                            className="text-txt-secondary hover:text-txt-primary transition-colors text-xl p-1 hover:bg-bg-primary rounded"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="w-8 h-8 text-red-600 dark:text-red-400" />
                        </div>

                        <h3 className="text-lg font-medium text-txt-primary mb-2">
                            Are you sure?
                        </h3>

                        <p className="text-sm text-txt-secondary leading-relaxed">
                            You&apos;re about to permanently delete{" "}
                            <span className="font-semibold text-txt-primary">
                                {notificationCount} notification
                                {notificationCount !== 1 ? "s" : ""}
                            </span>
                            . This action cannot be undone and will remove all your
                            notifications from the system.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-br-secondary bg-bg-primary">
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            disabled={isLoading || isDeleting}
                            className="flex-1 px-4 py-2.5 border border-br-secondary text-txt-secondary hover:text-txt-primary hover:border-br-primary transition-colors rounded-lg font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={isLoading || isDeleting}
                            className="flex-1 px-4 py-2.5 bg-red-600 text-white hover:bg-red-700 transition-colors rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isDeleting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="w-4 h-4" />
                                    Clear All
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
