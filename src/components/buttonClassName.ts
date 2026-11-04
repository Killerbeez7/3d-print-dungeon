import clsx from "clsx";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "ember" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

type ButtonStyleOptions = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
};

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
