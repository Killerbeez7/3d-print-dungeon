import type { CookieConsent } from "../types/cookies";

const CONSENT_COOKIE_NAME = "cookie_consent";
const CONSENT_COOKIE_DURATION = 365; // 1 year

function isCookieConsent(value: unknown): value is CookieConsent {
  if (!value || typeof value !== "object") {
    return false;
  }

  const consent = value as Record<string, unknown>;

  return (
    consent.essential === true &&
    typeof consent.analytics === "boolean" &&
    typeof consent.marketing === "boolean" &&
    typeof consent.payment === "boolean" &&
    typeof consent.accepted === "boolean"
  );
}

export function setCookie(name: string, value: string, days: number): void {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; expires=${expires}; path=/; SameSite=Lax`;
}

export function getCookie(name: string): string | null {
  return document.cookie.split("; ").reduce((r, v) => {
    const parts = v.split("=");
    return parts[0] === name ? decodeURIComponent(parts[1]) : r;
  }, null as string | null);
}

export function deleteCookie(name: string): void {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
}

export function setConsent(consent: CookieConsent): void {
  setCookie(CONSENT_COOKIE_NAME, JSON.stringify(consent), CONSENT_COOKIE_DURATION);
}

export function getConsent(): CookieConsent | null {
  const raw = getCookie(CONSENT_COOKIE_NAME);

  if (!raw) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(raw);

    if (!isCookieConsent(parsed)) {
      deleteConsent();
      return null;
    }

    return parsed;
  } catch {
    deleteConsent();
    return null;
  }
}

export function deleteConsent(): void {
  deleteCookie(CONSENT_COOKIE_NAME);
}
