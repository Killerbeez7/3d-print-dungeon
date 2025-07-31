export type CookieCategories = "essential" | "analytics" | "marketing";

export type CookieConsent = {
    essential: boolean;
    analytics: boolean;
    payment: boolean;
    marketing: boolean;
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


export interface ConsentRequirement {
    route: string;
    requiredConsent: CookieCategories[];
    description: string;
    fallbackPath?: string;
}

export interface FeatureConsentRequirement {
    feature: string;
    requiredConsent: CookieCategories[];
    description: string;
}