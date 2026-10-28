import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/features/shared/theme";

const options = [
  { value: "dark", label: "Dark", icon: Moon },
  { value: "light", label: "Light", icon: Sun },
] as const;

/** Two-option segmented control for the colour theme. */
export const ThemeToggle = ({ className = "" }: { className?: string }) => {
  const [theme, setTheme] = useTheme();
  const active = theme === "light" ? "light" : "dark";

  return (
    <div
      role="radiogroup"
      aria-label="Colour theme"
      className={`inline-flex rounded-lg border border-br-secondary bg-page p-0.5 ${className}`}
    >
      {options.map(({ value, label, icon: Icon }) => {
        const isActive = active === value;

        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => setTheme(value)}
            className={`flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors ${
              isActive
                ? "bg-surface-elevated text-txt-primary shadow-sm"
                : "text-txt-muted hover:text-txt-primary"
            }`}
          >
            <Icon className="size-3.5" aria-hidden="true" />
            {label}
          </button>
        );
      })}
    </div>
  );
};
