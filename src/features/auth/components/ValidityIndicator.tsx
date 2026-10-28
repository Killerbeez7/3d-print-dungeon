import { Check, X } from "lucide-react";
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
        sm: "size-4",
        md: "size-5",
        lg: "size-6",
    };

    const baseClasses = `absolute ${position} top-1/2 flex -translate-y-1/2 items-center`;

    switch (state) {
        case "loading":
            return (
                <div className={baseClasses}>
                    <Spinner size={16} delay={0} />
                </div>
            );

        case "valid":
            return (
                <div className={baseClasses}>
                    <Check className={`${sizeClasses[size]} text-success`} aria-label="Valid" />
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
                        aria-label="Clear field"
                        className={`${baseClasses} text-error transition-colors hover:text-error-hover`}
                    >
                        <X className={sizeClasses[size]} aria-hidden="true" />
                    </button>
                );
            }
            return null;

        default:
            return null;
    }
}
