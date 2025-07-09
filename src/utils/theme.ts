import { useState, useEffect, Dispatch, SetStateAction } from "react";

export type Theme = "light" | "dark" | "system";

const THEME_KEY = "theme";
const LIGHT: Theme = "light";
const DARK: Theme = "dark";
const SYSTEM: Theme = "system";


export function useTheme(): [Theme, Dispatch<SetStateAction<Theme>>] {
    const getInitialTheme = (): Theme => {
        const storedTheme = localStorage.getItem(THEME_KEY) as Theme | null;
        if (storedTheme === LIGHT || storedTheme === DARK || storedTheme === SYSTEM) return storedTheme;
        return SYSTEM;
    };

    const [theme, setTheme] = useState<Theme>(getInitialTheme);

    useEffect(() => {
        const applyTheme = (theme: Theme) => {
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