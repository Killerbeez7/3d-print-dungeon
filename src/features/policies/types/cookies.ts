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
    declineAll: () => void;
    setCategory: (category: CookieCategories, value: boolean, saveImmediately?: boolean) => void;
    updateMultipleCategories: (updates: Partial<CookieConsent>) => void;
    savePreferences: () => void;
    openSettings: () => void;
} 