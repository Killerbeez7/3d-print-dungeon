/**
 * Converts a display name to a URL-safe format
 * @param displayName - The display name to convert
 * @returns URL-safe version of the display name (lowercase, spaces replaced with hyphens)
 */
export function toUrlSafeName(displayName: string | null | undefined): string {
    const name = displayName || "Anonymous";
    return encodeURIComponent(name.toLowerCase().replace(/\s+/g, "-"));
} 