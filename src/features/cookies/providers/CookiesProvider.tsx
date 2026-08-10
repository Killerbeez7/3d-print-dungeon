import { useState, useMemo, useCallback, type ReactNode } from "react";
import { CookiesContext, defaultConsent } from "../context/CookiesContext";
import { setConsent, getConsent, deleteConsent } from "../services/cookiesServices";
import type {
  CookieConsent,
  CookiePreferencesUpdate,
  CookiesContextValue,
  OptionalCookieCategory,
} from "../types/cookies";

export function CookiesProvider({ children }: { children: ReactNode }) {
  const [consent, setConsentState] = useState<CookieConsent>(
    () => getConsent() ?? defaultConsent
  );

  const acceptAll = useCallback(() => {
    const newConsent: CookieConsent = {
      essential: true,
      analytics: true,
      marketing: true,
      payment: true,
      accepted: true,
    };

    setConsentState(newConsent);
    setConsent(newConsent);
  }, []);

  const declineAll = useCallback(() => {
    const newConsent: CookieConsent = {
      essential: true,
      analytics: false,
      marketing: false,
      payment: false,
      accepted: true,
    };

    setConsentState(newConsent);
    setConsent(newConsent);
  }, []);

  const setCategory = useCallback(
    (category: OptionalCookieCategory, value: boolean, saveImmediately = false) => {
      const newConsent: CookieConsent = {
        ...consent,
        [category]: value,
      };

      setConsentState(newConsent);

      if (saveImmediately) {
        setConsent(newConsent);
      }
    },
    [consent]
  );

  const updateMultipleCategories = useCallback(
    (updates: CookiePreferencesUpdate) => {
      const newConsent: CookieConsent = {
        ...consent,
        ...updates,
        essential: true,
      };

      setConsentState(newConsent);
      setConsent(newConsent);
    },
    [consent]
  );

  const savePreferences = useCallback(() => {
    const newConsent: CookieConsent = {
      ...consent,
      essential: true,
      accepted: true,
    };

    setConsentState(newConsent);
    setConsent(newConsent);
  }, [consent]);

  const openSettings = useCallback(() => {
    window.dispatchEvent(new CustomEvent("openCookieSettings"));
  }, []);

  const checkCookiesNeeded = useCallback(
    (feature: OptionalCookieCategory) => {
      const needed = !consent[feature];

      return {
        needed,
        type: needed ? feature : null,
      };
    },
    [consent]
  );

  const resetToDefault = useCallback(() => {
    deleteConsent();
    setConsentState(defaultConsent);
  }, []);

  const contextValue = useMemo<CookiesContextValue>(
    () => ({
      consent,
      acceptAll,
      declineAll,
      setCategory,
      updateMultipleCategories,
      savePreferences,
      openSettings,
      checkCookiesNeeded,
      resetToDefault,
    }),
    [
      consent,
      acceptAll,
      declineAll,
      setCategory,
      updateMultipleCategories,
      savePreferences,
      openSettings,
      checkCookiesNeeded,
      resetToDefault,
    ]
  );

  return (
    <CookiesContext.Provider value={contextValue}>{children}</CookiesContext.Provider>
  );
}
