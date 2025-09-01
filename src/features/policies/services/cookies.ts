const CONSENT_COOKIE_NAME = "cookie_consent";
const CONSENT_COOKIE_DURATION = 365; // 1 year

export function setCookie(name: string, value: string, days: number): void {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

export function getCookie(name: string): string | null {
    return document.cookie.split('; ').reduce((r, v) => {
        const parts = v.split('=');
        return parts[0] === name ? decodeURIComponent(parts[1]) : r;
    }, null as string | null);
}

export function deleteCookie(name: string): void {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
}

// Store consent in actual cookies (better for GDPR compliance)
export function setConsent(consent: object): void {
    setCookie(CONSENT_COOKIE_NAME, JSON.stringify(consent), CONSENT_COOKIE_DURATION);
}

export function getConsent<T = object>(): T | null {
    const raw = getCookie(CONSENT_COOKIE_NAME);
    return raw ? JSON.parse(raw) as T : null;
}

export function deleteConsent(): void {
    deleteCookie(CONSENT_COOKIE_NAME);
}

export function areCookiesEnabled(): boolean {
    try {
        document.cookie = "test=1";
        const enabled = document.cookie.indexOf("test=") !== -1;
        document.cookie = "test=1; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        return enabled;
    } catch {
        return false;
    }
}

export function clearAllCookies(): void {
    const cookies = document.cookie.split(";");

    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    }
}

export function getCookieConsentStatus(): "accepted" | "declined" | "not-set" {
    const consent = getConsent();
    if (!consent) return "not-set";

    const consentData = consent as { accepted?: boolean };
    return consentData.accepted ? "accepted" : "declined";
}

// Utility functions for testing and debugging
export function resetCookieConsent(): void {
    deleteConsent();
    console.log("Cookie consent reset for testing");
}

export function resetNonEssentialCookies(): void {
    // Clear all cookies except the consent cookie
    const cookies = document.cookie.split(";");
    
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        
        // Don't delete the consent cookie
        if (name !== CONSENT_COOKIE_NAME) {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
        }
    }
    
    console.log("Non-essential cookies cleared, consent cookie preserved");
}

export function getAllCookies(): Record<string, string> {
    const cookies: Record<string, string> = {};
    document.cookie.split(';').forEach(cookie => {
        const [name, value] = cookie.trim().split('=');
        if (name && value) {
            cookies[name] = decodeURIComponent(value);
        }
    });
    return cookies;
}

export function logCookieConsent(): void {
    const consent = getConsent();
    console.log("Current cookie consent:", consent);
    console.log("All cookies:", getAllCookies());
} 