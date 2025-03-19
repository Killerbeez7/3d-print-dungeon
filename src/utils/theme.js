import { useState, useEffect } from "react";

const THEME_KEY = "theme";
const LIGHT = "light";
const DARK = "dark";
const SYSTEM = "system";

export function useTheme() {
    const getInitialTheme = () => {
        const storedTheme = localStorage.getItem(THEME_KEY);
        if (storedTheme) return storedTheme;
        return SYSTEM;
    };

    const [theme, setTheme] = useState(getInitialTheme);

    useEffect(() => {
        const applyTheme = (theme) => {
            if (theme === SYSTEM) {
                const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                document.documentElement.setAttribute("data-theme", prefersDark ? DARK : LIGHT);
            } else {
                document.documentElement.setAttribute("data-theme", theme);
            }
        };

        applyTheme(theme);
        localStorage.setItem(THEME_KEY, theme);
    }, [theme]);

    return [theme, setTheme];
}