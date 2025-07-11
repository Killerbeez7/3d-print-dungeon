import { createContext, useContext, useState, ReactNode } from "react";

export type CookieCategories = "essential" | "analytics" | "marketing" | "payment";

export type CookieConsent = {
    essential: boolean;
    analytics: boolean;
    marketing: boolean;
    payment: boolean;
    accepted: boolean;
};

export interface CookiesContextValue {
    consent: CookieConsent;
    acceptAll: () => void;
    setCategory: (category: CookieCategories, value: boolean) => void;
    savePreferences: () => void;
    openSettings: () => void;
}

const defaultConsent: CookieConsent = {
    essential: true,
    analytics: false,
    marketing: false,
    payment: false,
    accepted: false,
};

export const CookiesContext = createContext<CookiesContextValue | undefined>(undefined);

export function CookiesProvider({ children }: { children: ReactNode }) {
    const [consent, setConsent] = useState<CookieConsent>(defaultConsent);
    const acceptAll = () => setConsent({ ...defaultConsent, analytics: true, marketing: true, payment: true, accepted: true });
    const setCategory = (category: CookieCategories, value: boolean) => setConsent(prev => ({ ...prev, [category]: value }));
    const savePreferences = () => setConsent(prev => ({ ...prev, accepted: true }));
    const openSettings = () => {/* Implement modal/page navigation */};
    return (
        <CookiesContext.Provider value={{ consent, acceptAll, setCategory, savePreferences, openSettings }}>
            {children}
        </CookiesContext.Provider>
    );
}

export function useCookiesContext(): CookiesContextValue {
    const ctx = useContext(CookiesContext);
    if (!ctx) throw new Error("useCookiesContext must be used within CookiesProvider");
    return ctx;
} 