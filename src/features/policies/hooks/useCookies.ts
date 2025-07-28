import { useContext } from "react";
import { CookiesContext } from "../context/CookiesContext";
import { CookiesContextValue } from "../types/cookies";

export function useCookies(): CookiesContextValue {
    const ctx = useContext(CookiesContext);
    if (!ctx) throw new Error("useCookies must be used within CookiesProvider");
    return ctx;
}