import { useState, KeyboardEvent, Dispatch, SetStateAction } from "react";
import { useTheme } from "@/features/shared/theme";

export interface ThemeOption {
    id: string;
    label: string;
}

export const AccountSettings = () => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [themeRaw, setThemeRaw] = useTheme();
    const theme: string = typeof themeRaw === "string" ? themeRaw : "system";
    const setTheme: (theme: string) => void =
        typeof setThemeRaw === "function"
            ? (t: string) => (setThemeRaw as Dispatch<SetStateAction<string>>)(t)
            : () => {};

    const themes: ThemeOption[] = [
        { id: "system", label: "OS Default" },
        { id: "light", label: "Light" },
        { id: "dark", label: "Dark" },
    ];

    const handleThemeSelect = (t: ThemeOption): void => {
        setTheme(t.id);
        setIsOpen(false);
    };

    const handleDropdownKeyDown = (e: KeyboardEvent<HTMLDivElement>): void => {
        if (e.key === "Enter" || e.key === " ") setIsOpen(!isOpen);
    };

    return (
        <div>
            <h2 className="text-xl font-semibold text-txt-primary pb-2">
                Account Settings
            </h2>

            <div className="flex items-center justify-between pt-4 divider-top-left">
                <p className="w-1/3 text-txt-secondary text-lg font-medium">
                    Theme Preference
                </p>

                <div className="relative w-2/3">
                    <div
                        className="relative cursor-pointer border border-br-secondary pl-3 py-2 rounded-md text-txt-primary bg-bg-secondary"
                        onClick={() => setIsOpen(!isOpen)}
                        role="button"
                        tabIndex={0}
                        aria-label="Select theme"
                        onKeyDown={handleDropdownKeyDown}
                    >
                        <span>
                            {themes.find((t) => t.id === theme)?.label || "Select Theme"}
                        </span>
                    </div>

                    {isOpen && (
                        <div className="absolute left-0 mt-1 w-full rounded-md shadow-md bg-bg-secondary border border-br-secondary transition-all duration-200 p-2">
                            {themes.map((t) => (
                                <button
                                    key={t.id}
                                    className="block w-full text-left px-3 py-2 text-md text-txt-secondary hover:bg-bg-surface hover:text-txt-primary hover:rounded-sm hover:shadow-sm hover:font-semibold"
                                    type="button"
                                    onClick={() => handleThemeSelect(t)}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
