import { useState, useEffect } from "react";

const THEME_KEY = "theme";
const LIGHT = "light";
const DARK = "dark";

export function useTheme() {
    // Get the initial theme, fallback to system preference if not set in localStorage
    const getInitialTheme = () => {
        const storedTheme = localStorage.getItem(THEME_KEY);
        if (storedTheme) return storedTheme;
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? DARK : LIGHT;
    };

    const [theme, setTheme] = useState(getInitialTheme);

    useEffect(() => {
        // Apply the theme to the document
        document.documentElement.setAttribute("data-theme", theme);
        // Store the theme in localStorage
        localStorage.setItem(THEME_KEY, theme);
    }, [theme]);

    const toggleTheme = () => {
        // Toggle between light and dark theme
        setTheme((prev) => (prev === LIGHT ? DARK : LIGHT));
    };

    return [theme, toggleTheme];
}
