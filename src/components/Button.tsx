import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

type ButtonStyleOptions = {
    variant?: ButtonVariant;
    size?: ButtonSize;
    fullWidth?: boolean;
    className?: string;
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    isLoading?: boolean;
    fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
    primary:
        "border-transparent bg-accent text-[#061111] shadow-sm hover:bg-accent-hover hover:shadow-md",
    secondary:
        "border-br-secondary bg-bg-surface text-txt-primary hover:border-br-primary hover:bg-[var(--bg-tertiary)]",
    ghost:
        "border-transparent bg-transparent text-txt-secondary hover:bg-bg-surface hover:text-txt-primary",
};

const sizeClasses: Record<ButtonSize, string> = {
    sm: "h-9 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-11 px-5 text-base",
};

const joinClasses = (...classes: Array<string | false | null | undefined>): string =>
    classes.filter(Boolean).join(" ");

export const buttonStyles = ({
    variant = "primary",
    size = "md",
    fullWidth = false,
    className,
}: ButtonStyleOptions = {}): string =>
    joinClasses(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border font-semibold leading-none no-underline transition-colors duration-150",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
        "disabled:pointer-events-none disabled:opacity-55",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full",
        className
    );

export const Button = ({
    variant = "primary",
    size = "md",
    leftIcon,
    rightIcon,
    isLoading = false,
    fullWidth = false,
    className,
    children,
    disabled,
    type = "button",
    ...props
}: ButtonProps): React.ReactNode => {
    const isDisabled = disabled || isLoading;

    return (
        <button
            type={type}
            className={buttonStyles({ variant, size, fullWidth, className })}
            disabled={isDisabled}
            aria-busy={isLoading || undefined}
            {...props}
        >
            {isLoading ? (
                <span
                    className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin"
                    aria-hidden="true"
                />
            ) : (
                leftIcon
            )}
            {children}
            {!isLoading && rightIcon}
        </button>
    );
};
