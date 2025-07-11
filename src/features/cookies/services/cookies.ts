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

export function setConsent(consent: object): void {
    localStorage.setItem("cookieConsent", JSON.stringify(consent));
}

export function getConsent<T = object>(): T | null {
    const raw = localStorage.getItem("cookieConsent");
    return raw ? JSON.parse(raw) as T : null;
} 