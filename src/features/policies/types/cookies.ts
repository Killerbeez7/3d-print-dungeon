export type CookieCategory = "essential" | "analytics" | "marketing" | "payment";

export type OptionalCookieCategory = Exclude<CookieCategory, "essential">;

export interface CookieConsent {
  essential: true;
  analytics: boolean;
  marketing: boolean;
  payment: boolean;
  accepted: boolean;
}

export type CookiePreferencesUpdate = Partial<Omit<CookieConsent, "essential">>;

export interface CookieCheckResult {
  needed: boolean;
  type: OptionalCookieCategory | null;
}

export interface CookiesContextValue {
  consent: CookieConsent;

  acceptAll: () => void;
  declineAll: () => void;

  setCategory: (
    category: OptionalCookieCategory,
    value: boolean,
    saveImmediately?: boolean
  ) => void;

  updateMultipleCategories: (updates: CookiePreferencesUpdate) => void;

  savePreferences: () => void;
  openSettings: () => void;

  checkCookiesNeeded: (feature: OptionalCookieCategory) => CookieCheckResult;

  resetToDefault: () => void;
}
