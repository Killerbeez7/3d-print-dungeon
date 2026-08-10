import { createContext } from "react";
import type { CookieConsent, CookiesContextValue } from "../types/cookies";

export const defaultConsent: CookieConsent = {
  essential: true,
  analytics: false,
  marketing: false,
  payment: false,
  accepted: false,
};

export const CookiesContext = createContext<CookiesContextValue | undefined>(undefined);
