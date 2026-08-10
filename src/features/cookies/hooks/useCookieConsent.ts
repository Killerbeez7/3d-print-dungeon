import { useCookies } from "./useCookies";
import type { CookieCategory } from "../types/cookies";

export function useCookieConsent() {
  const { consent } = useCookies();

  const hasConsent = (categories: CookieCategory | CookieCategory[]): boolean => {
    const categoryList = Array.isArray(categories) ? categories : [categories];

    return categoryList.every((category) => consent[category]);
  };

  const hasAnyConsent = (categories: CookieCategory[]): boolean => {
    return categories.some((category) => consent[category]);
  };

  const getMissingConsent = (categories: CookieCategory[]): CookieCategory[] => {
    return categories.filter((category) => !consent[category]);
  };

  return {
    consent,
    hasConsent,
    hasAnyConsent,
    getMissingConsent,
    isAccepted: consent.accepted,
  };
}
