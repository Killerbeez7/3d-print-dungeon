import { useState } from "react";
import { useTheme } from "../../utils/theme";

const themes = [
    { id: "system", label: "OS Default" },
    { id: "light", label: "Light" },
    { id: "dark", label: "Dark" }
];

export const AccountSettings = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [theme, setTheme] = useTheme();

    return (
        <div>
            <h2 className="text-xl font-semibold text-txt-primary pb-2 border-b border-br-primary">
                Account Settings
            </h2>

            <div className="flex items-center justify-between mt-4">
                <p className="w-1/3 text-txt-secondary text-lg font-medium">Theme Preference</p>

                <div className="relative w-2/3">
                    <div
                        className="relative cursor-pointer border border-br-primary px-2 py-2 rounded-md text-txt-primary bg-bg-primary"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <span>{themes.find((t) => t.id === theme)?.label || "Select Theme"}</span>
                    </div>

                    {isOpen && (
                        <div className="absolute text-txt-secondary mt-1 bg-bg-primary w-full border border-br-primary rounded-md shadow-md z-10 overflow-hidden">
                            {themes.map((t) => (
                                <button
                                    key={t.id}
                                    className="block w-full text-left px-2 py-2 hover:bg-bg-secondary hover:text-txt-primary hover:cursor-pointer transition"
                                    onClick={() => {
                                        setTheme(t.id);
                                        setIsOpen(false);
                                    }}
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