import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";
import { Spinner } from "@/features/shared/reusable/Spinner";

interface ValidityIndicatorProps {
    state: "loading" | "valid" | "invalid" | "error" | null;
    position?: string;
    onClear?: () => void;
    showClearButton?: boolean;
    size?: "sm" | "md" | "lg";
}

export function ValidityIndicator({
    state,
    position = "right-3",
    onClear,
    showClearButton = false,
    size = "sm",
}: ValidityIndicatorProps) {
    if (!state) return null;

    const sizeClasses = {
        sm: "text-sm",
        md: "text-base",
        lg: "text-lg",
    };

    const baseClasses = `absolute ${position} top-1/2 -translate-y-1/2`;

    switch (state) {
        case "loading":
            return (
                <div className={baseClasses}>
                    <Spinner size={16} />
                </div>
            );

        case "valid":
            return (
                <div className={baseClasses}>
                    <FontAwesomeIcon
                        icon={faCheck}
                        className={`${sizeClasses[size]} text-gray-500`}
                    />
                </div>
            );

        case "invalid":
            return null;

        case "error":
            if (showClearButton && onClear) {
                return (
                    <button
                        type="button"
                        onClick={onClear}
                        className={`${baseClasses} text-red-500 hover:text-red-600 transition-colors`}
                    >
                        <FontAwesomeIcon icon={faTimes} className={sizeClasses[size]} />
                    </button>
                );
            }
            return null;

        default:
            return null;
    }
}
