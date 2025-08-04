export function toUrlSafeUsername(username: string | null | undefined): string {
    const name = username || "anonymous";
    return encodeURIComponent(name.toLowerCase().replace(/\s+/g, "-"));
} 