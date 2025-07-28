import { useCookies } from "./useCookies";
import { CookieCategories } from "../types/cookies";

export function useCookieConsent() {
    const { consent } = useCookies();

    const hasConsent = (categories: CookieCategories | CookieCategories[]): boolean => {
        const categoryArray = Array.isArray(categories) ? categories : [categories];
        return categoryArray.every(category => consent[category]);
    };

    const hasAnyConsent = (categories: CookieCategories[]): boolean => {
        return categories.some(category => consent[category]);
    };

    const getMissingConsent = (categories: CookieCategories[]): CookieCategories[] => {
        return categories.filter(category => !consent[category]);
    };

    return {
        consent,
        hasConsent,
        hasAnyConsent,
        getMissingConsent,
        isAccepted: consent.accepted,
    };
} 