import { useCallback, useSyncExternalStore, Dispatch, SetStateAction } from "react";

const LIGHT = "light" as const;
const DARK = "dark" as const;

// "system" is a legacy stored value; it is treated as the dark default.
export type Theme = typeof LIGHT | typeof DARK | "system";

type NonSystemTheme = typeof LIGHT | typeof DARK;

const THEME_KEY = "theme";

// Matches the navbar surface (--bg-section) so mobile browser bars blend in.
const THEME_COLORS: Record<NonSystemTheme, string> = {
    light: "#ffffff",
    dark: "#0f0f12",
};

function getStoredTheme(): NonSystemTheme {
    try {
        return localStorage.getItem(THEME_KEY) === LIGHT ? LIGHT : DARK;
    } catch {
        return DARK;
    }
}

function applyTheme(theme: Theme): void {
    // Legacy "system" values are pinned to the app default.
    const applied: NonSystemTheme = theme === LIGHT ? LIGHT : DARK;
    document.documentElement.setAttribute("data-theme", applied);
    document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute("content", THEME_COLORS[applied]);
}

// One shared theme value, so every component using the hook stays in sync.
let currentTheme: Theme = typeof window === "undefined" ? DARK : getStoredTheme();
const listeners = new Set<() => void>();

function setSharedTheme(next: Theme): void {
    currentTheme = next;
    try {
        localStorage.setItem(THEME_KEY, next);
    } catch {
        // Storage can be unavailable (private mode); the theme still applies.
    }
    applyTheme(next);
    listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
    listeners.add(listener);

    // Follow changes made in other tabs.
    const handleStorage = (event: StorageEvent) => {
        if (event.key !== THEME_KEY) return;
        currentTheme = getStoredTheme();
        applyTheme(currentTheme);
        listener();
    };
    window.addEventListener("storage", handleStorage);

    return () => {
        listeners.delete(listener);
        window.removeEventListener("storage", handleStorage);
    };
}

export function useTheme(): [Theme, Dispatch<SetStateAction<Theme>>] {
    const theme = useSyncExternalStore(
        subscribe,
        () => currentTheme,
        () => DARK
    );

    const setTheme = useCallback<Dispatch<SetStateAction<Theme>>>((value) => {
        setSharedTheme(typeof value === "function" ? value(currentTheme) : value);
    }, []);

    return [theme, setTheme];
}
