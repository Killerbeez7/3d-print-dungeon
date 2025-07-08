export interface FullscreenConfig {
    enter: (element: Element) => Promise<void> | void;
    exit: () => Promise<void> | void;
    isFullscreen: () => boolean;
    onChange: (callback: () => void) => () => void;
}

export const fullscreenConfig: FullscreenConfig = {
    enter: (element: Element): Promise<void> | void => {
        if (element.requestFullscreen) return element.requestFullscreen();
        // @ts-expect-error: webkitRequestFullscreen is a vendor-prefixed fullscreen API
        if (element.webkitRequestFullscreen) return element.webkitRequestFullscreen();
        // @ts-expect-error: mozRequestFullScreen is a vendor-prefixed fullscreen API
        if (element.mozRequestFullScreen) return element.mozRequestFullScreen();
        // @ts-expect-error: msRequestFullscreen is a vendor-prefixed fullscreen API
        if (element.msRequestFullscreen) return element.msRequestFullscreen();
    },
    exit: (): Promise<void> | void => {
        if (document.exitFullscreen) return document.exitFullscreen();
        // @ts-expect-error: webkitExitFullscreen is a vendor-prefixed fullscreen API
        if (document.webkitExitFullscreen) return document.webkitExitFullscreen();
        // @ts-expect-error: mozCancelFullScreen is a vendor-prefixed fullscreen API
        if (document.mozCancelFullScreen) return document.mozCancelFullScreen();
        // @ts-expect-error: msExitFullscreen is a vendor-prefixed fullscreen API
        if (document.msExitFullscreen) return document.msExitFullscreen();
    },
    isFullscreen: (): boolean =>
        Boolean(
            document.fullscreenElement ||
                // @ts-expect-error: webkitFullscreenElement is a vendor-prefixed fullscreen API
                document.webkitFullscreenElement ||
                // @ts-expect-error: mozFullScreenElement is a vendor-prefixed fullscreen API
                document.mozFullScreenElement ||
                // @ts-expect-error: msFullscreenElement is a vendor-prefixed fullscreen API
                document.msFullscreenElement
        ),
    onChange: (callback: () => void): (() => void) => {
        const events = [
            "fullscreenchange",
            "webkitfullscreenchange",
            "mozfullscreenchange",
            "MSFullscreenChange",
        ];
        events.forEach((event) => document.addEventListener(event, callback));
        return () =>
            events.forEach((event) => document.removeEventListener(event, callback));
    },
};
