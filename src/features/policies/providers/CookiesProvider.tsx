import { useState, useEffect, ReactNode } from "react";
import { CookiesContext, defaultConsent } from "../context/CookiesContext";
import { setConsent, getConsent, resetNonEssentialCookies, deleteConsent } from "../services/cookies";
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
            essential: true, // Always true
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
            accepted: true, // User has made a choice, banner won't show again
        };
        setConsentState(newConsent);
        setConsent(newConsent);
    };

    const setCategory = (category: CookieCategories, value: boolean, saveImmediately = false) => {
        // Don't allow disabling essential cookies
        if (category === 'essential') {
            return;
        }
        
        const newConsent = { ...consent, [category]: value };
        setConsentState(newConsent);
        
        if (saveImmediately) {
            setConsent(newConsent);
        }
    };

    const updateMultipleCategories = (updates: Partial<CookieConsent>) => {
        const newConsent = { 
            ...consent, 
            ...updates,
            essential: true // Always ensure essential is true
        };
        setConsentState(newConsent);
        setConsent(newConsent);
    };

    const savePreferences = () => {
        // Save the current consent state with accepted: true
        const newConsent = { 
            ...consent, 
            essential: true, // Always ensure essential is true
            accepted: true 
        };
        setConsentState(newConsent);
        setConsent(newConsent);
    };

    const openSettings = () => {
        // This can be used to open a modal or navigate to settings page
        console.log("Open cookie settings");
    };

    const resetToDefault = () => {
        // Reset to default state by completely clearing consent
        // This will make the banner show again
        deleteConsent();
        setConsentState(defaultConsent);
        
        // Clear all non-essential cookies
        resetNonEssentialCookies();
    };

    const checkCookiesNeeded = (feature: 'analytics' | 'marketing' | 'payment') => {
        // Check if a specific feature needs cookies and if user has consented
        if (feature === 'analytics' && !consent.analytics) {
            return { needed: true, type: 'analytics' };
        }
        if (feature === 'marketing' && !consent.marketing) {
            return { needed: true, type: 'marketing' };
        }
        if (feature === 'payment' && !consent.payment) {
            return { needed: true, type: 'payment' };
        }
        return { needed: false, type: null };
    };

    const contextValue: CookiesContextValue = {
        consent,
        acceptAll,
        declineAll,
        setCategory,
        updateMultipleCategories,
        savePreferences,
        openSettings,
        checkCookiesNeeded,
        resetToDefault
    };

    return (
        <CookiesContext.Provider value={contextValue}>
            {children}
        </CookiesContext.Provider>
    );
} 