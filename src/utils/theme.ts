import { useState, useEffect, Dispatch, SetStateAction } from "react";

const LIGHT = "light" as const;
const DARK = "dark" as const;
const SYSTEM = "system" as const;

export type Theme = typeof LIGHT | typeof DARK | typeof SYSTEM;

type NonSystemTheme = Exclude<Theme, typeof SYSTEM>;

const THEME_KEY = "theme";

function getSystemTheme(): NonSystemTheme {
    if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? DARK : LIGHT;
    }
    return LIGHT;
}

function getStoredTheme(): NonSystemTheme | null {
    if (typeof localStorage === "undefined") return null;
    const stored = localStorage.getItem(THEME_KEY) as Theme | null;
    if (stored === LIGHT || stored === DARK) return stored;
    return null;
}


export function useTheme(): [Theme, Dispatch<SetStateAction<Theme>>] {
    const [theme, setTheme] = useState<Theme>(() => {
        return getStoredTheme() ?? SYSTEM;
    });

    useEffect(() => {
        const applied: NonSystemTheme =
            theme === SYSTEM ? getSystemTheme() : theme;

        if (typeof document !== "undefined") {
            document.documentElement.setAttribute("data-theme", applied);
        }

        if (typeof localStorage !== "undefined") {
            localStorage.setItem(THEME_KEY, theme);
        }
    }, [theme]);

    return [theme, setTheme];
}
