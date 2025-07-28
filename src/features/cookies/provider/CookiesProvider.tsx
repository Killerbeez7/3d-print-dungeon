import { useState, useEffect, ReactNode } from "react";
import { CookiesContext, defaultConsent } from "../context/CookiesContext";
import { setConsent, getConsent } from "../services/cookies";
import { CookieCategories, CookieConsent, CookiesContextValue } from "../types/cookies";

export function CookiesProvider({ children }: { children: ReactNode }) {
    const [consent, setConsentState] = useState<CookieConsent>(defaultConsent);

    // Load saved consent on mount
    useEffect(() => {
        const savedConsent = getConsent<CookieConsent>();
        if (savedConsent) {
            setConsentState(savedConsent);
        }
    }, []);

    const acceptAll = () => {
        const newConsent = { 
            ...defaultConsent, 
            analytics: true, 
            marketing: true, 
            payment: true, 
            accepted: true 
        };
        setConsentState(newConsent);
        setConsent(newConsent);
    };

    const declineAll = () => {
        const newConsent = {
            essential: true,
            analytics: false,
            marketing: false,
            payment: false,
            accepted: false,
        };
        setConsentState(newConsent);
        setConsent(newConsent);
    };

    const setCategory = (category: CookieCategories, value: boolean, saveImmediately = false) => {
        const newConsent = { ...consent, [category]: value };
        setConsentState(newConsent);
        
        if (saveImmediately) {
            setConsent(newConsent);
        }
    };

    const updateMultipleCategories = (updates: Partial<CookieConsent>) => {
        const newConsent = { ...consent, ...updates };
        setConsentState(newConsent);
        setConsent(newConsent);
    };

    const savePreferences = () => {
        // Save the current consent state with accepted: true
        const newConsent = { ...consent, accepted: true };
        setConsentState(newConsent);
        setConsent(newConsent);
    };

    const openSettings = () => {
        // This can be used to open a modal or navigate to settings page
        console.log("Open cookie settings");
    };

    const contextValue: CookiesContextValue = {
        consent,
        acceptAll,
        declineAll,
        setCategory,
        updateMultipleCategories,
        savePreferences,
        openSettings
    };

    return (
        <CookiesContext.Provider value={contextValue}>
            {children}
        </CookiesContext.Provider>
    );
} 