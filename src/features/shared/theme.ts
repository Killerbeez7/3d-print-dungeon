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

    // Apply theme whenever it changes
    useEffect(() => {
        const applied: NonSystemTheme = theme === SYSTEM ? getSystemTheme() : theme;
        if (typeof document !== "undefined") {
            document.documentElement.setAttribute("data-theme", applied);
        }
        if (typeof localStorage !== "undefined") {
            localStorage.setItem(THEME_KEY, theme);
        }
    }, [theme]);

    // Sync when the user changes their OS preference while in "system" mode
    useEffect(() => {
        if (theme !== SYSTEM || typeof window === "undefined") return;
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        const syncSystem = () => {
            const applied = mq.matches ? DARK : LIGHT;
            if (typeof document !== "undefined") {
                document.documentElement.setAttribute("data-theme", applied);
            }
        };
        syncSystem();
        // Newer browsers
        if (typeof mq.addEventListener === "function") {
            mq.addEventListener("change", syncSystem);
            return () => mq.removeEventListener("change", syncSystem);
        }
    }, [theme]);

    return [theme, setTheme];
}
