import { useEffect } from "react";
import { createPortal } from "react-dom";

type AlertModalProps = {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
};

const AlertModal: React.FC<AlertModalProps> = ({
    isOpen,
    onClose,
    title,
    message,
}) => {
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleEsc);
        return () => document.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    if (!isOpen) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ pointerEvents: "auto" }}
            onClick={onClose}>
            {/* Background overlay */}
            <div className="absolute inset-0 bg-black/60" />

            {/* Modal content */}
            <div
                className="fixed bg-bg-secondary text-txt-primary border border-br-secondary rounded-2xl p-6 w-[90%] max-w-md shadow-xl z-100"
                onClick={(e) => e.stopPropagation()}>
                <h2 className="text-xl font-michroma mb-3">{title}</h2>
                <p className="text-txt-secondary mb-6">{message}</p>
                <div className="flex justify-center">
                    <button onClick={onClose} className="cta-button px-6 py-2">
                        OK
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default AlertModal;
