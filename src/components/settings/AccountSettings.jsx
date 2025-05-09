import { useState } from "react";
import { useTheme } from "../../utils/theme";

const themes = [
    { id: "system", label: "OS Default" },
    { id: "light", label: "Light" },
    { id: "dark", label: "Dark" },
];

export const AccountSettings = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [theme, setTheme] = useTheme();

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
                        onClick={() => setIsOpen(!isOpen)}>
                        <span>
                            {themes.find((t) => t.id === theme)?.label ||
                                "Select Theme"}
                        </span>
                    </div>

                    {isOpen && (
                        <div className="absolute left-0 mt-1 w-full rounded-md shadow-md bg-bg-secondary border border-br-secondary transition-all duration-200 p-2">
                            {themes.map((t) => (
                                <button
                                    key={t.id}
                                    className="block w-full text-left px-3 py-2 text-md text-txt-secondary hover:bg-bg-surface hover:text-txt-primary hover:rounded-sm hover:shadow-sm hover:font-semibold"
                                    onClick={() => {
                                        setTheme(t.id);
                                        setIsOpen(false);
                                    }}>
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
