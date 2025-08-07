export const getDeviceType = () => {
    const isIOS =
        typeof navigator !== "undefined" &&
        (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
            (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));
    const isMobile =
        typeof window !== "undefined" && /Mobi|Android/i.test(navigator.userAgent);

    return { isIOS, isMobile };
};