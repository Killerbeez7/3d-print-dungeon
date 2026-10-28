import type { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "ember" | "danger";
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

/**
 * Class names for the chamfered button look (styles live in styles.css,
 * `.btn*`). Use it to style a <Link> or <a> as a button.
 */
export const buttonClassName = ({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
}: ButtonStyleOptions = {}) =>
  clsx("btn", `btn-${variant}`, `btn-${size}`, fullWidth && "w-full", className);

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
}: ButtonProps) => {
  const isDisabled = disabled || isLoading;

  return (
    <button
      {...props}
      type={type}
      className={buttonClassName({ variant, size, fullWidth, className })}
      disabled={isDisabled}
      aria-busy={isLoading || undefined}
    >
      {isLoading ? (
        <span
          className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
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
