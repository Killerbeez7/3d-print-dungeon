import type { ChangeEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { ValidityIndicator } from "./ValidityIndicator";

export interface AuthFieldState {
  value: string;
  isChecking?: boolean;
  isValid?: boolean;
  hasError?: boolean;
}

interface AuthFieldProps {
  name: string;
  label: string;
  type: "email" | "password";
  icon: LucideIcon;
  field: AuthFieldState;
  error?: string | null;
  autoComplete: string;
  placeholder: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onBlur: (event: ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  isVisible?: boolean;
  onToggleVisibility?: () => void;
}

const fieldState = (field: AuthFieldState) =>
  field.isChecking ? "loading" : field.isValid ? "valid" : field.hasError ? "error" : null;

/** Labelled input with icon, live validity and optional show/hide toggle. */
export const AuthField = ({
  name,
  label,
  type,
  icon: Icon,
  field,
  error,
  autoComplete,
  placeholder,
  onChange,
  onBlur,
  onClear,
  isVisible,
  onToggleVisibility,
}: AuthFieldProps) => {
  const isPassword = type === "password";
  const errorId = `${name}-error`;

  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-txt-secondary">
        {label}
      </label>
      <div className="relative">
        <Icon
          className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-txt-muted"
          aria-hidden="true"
        />
        <input
          id={name}
          name={name}
          type={isPassword && isVisible ? "text" : type}
          value={field.value}
          onChange={onChange}
          onBlur={onBlur}
          required
          spellCheck="false"
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error ? errorId : undefined}
          className={`h-12 w-full rounded-lg border bg-page pl-10 text-sm text-txt-primary transition-[border-color,box-shadow] placeholder:text-txt-muted focus:outline-none focus:ring-2 ${
            isPassword ? "pr-20" : "pr-10"
          } ${
            error
              ? "border-error focus:ring-error/25"
              : "border-br-input hover:border-txt-muted focus:border-accent focus:ring-accent/25"
          }`}
        />
        {isPassword && onToggleVisibility && (
          <button
            type="button"
            onClick={onToggleVisibility}
            aria-label={isVisible ? "Hide password" : "Show password"}
            aria-pressed={isVisible}
            className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-txt-muted transition-colors hover:bg-muted hover:text-txt-primary"
          >
            {isVisible ? (
              <EyeOff className="size-4" aria-hidden="true" />
            ) : (
              <Eye className="size-4" aria-hidden="true" />
            )}
          </button>
        )}
        <ValidityIndicator
          state={fieldState(field)}
          position={isPassword ? "right-11" : "right-3.5"}
          onClear={onClear}
          showClearButton={field.hasError}
        />
      </div>
      {error && (
        <p id={errorId} className="mt-1.5 text-sm text-error">
          {error}
        </p>
      )}
    </div>
  );
};
