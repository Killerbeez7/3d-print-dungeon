import { STATIC_ASSETS } from "@/config/assetsConfig";

export const getAvatarUrl = (photoURL?: string | null): string => {
    if (photoURL && photoURL.trim() !== "") return photoURL;
    return STATIC_ASSETS.DEFAULT_AVATAR;
};


export const getAvatarUrlWithCacheBust = (photoURL?: string | null): string => {
    const avatarUrl = getAvatarUrl(photoURL);

    // Handle Google profile images - they often have CORS issues
    if (avatarUrl.includes("googleusercontent.com")) {
        // Try to get a higher resolution version and add cache busting
        const highResUrl = avatarUrl.replace(/=s\d+-c/, "=s512-c");
        const separator = highResUrl.includes("?") ? "&" : "?";
        return `${highResUrl}${separator}v=${Date.now()}`;
    }

    // Handle Facebook profile images
    if (avatarUrl.includes("facebook.com")) {
        // If type is set via query, upgrade; otherwise append
        const hasQuery = avatarUrl.includes("?");
        const upgraded = /[?&]type=normal/.test(avatarUrl)
            ? avatarUrl.replace(/([?&])type=normal/, "$1type=large")
            : `${avatarUrl}${hasQuery ? "&" : "?"}type=large`;
        const separator = upgraded.includes("?") ? "&" : "?";
        return `${upgraded}${separator}v=${Date.now()}`;
    }

    return avatarUrl;
};
