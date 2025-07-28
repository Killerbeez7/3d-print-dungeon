import { useEffect } from "react";
import { useCookieConsent } from "@/features/policies/hooks/useCookieConsent";

type AnalyticsEventData = Record<string, string | number | boolean>;
type GtagFunction = (
    command: string,
    targetId: string,
    config?: Record<string, unknown>
) => void;

declare global {
    interface Window {
        gtag?: GtagFunction;
    }
}

interface AnalyticsTrackerProps {
    eventName: string;
    eventData?: AnalyticsEventData;
    children?: React.ReactNode;
}

export function AnalyticsTracker({
    eventName,
    eventData,
    children,
}: AnalyticsTrackerProps) {
    const { hasConsent } = useCookieConsent();

    useEffect(() => {
        if (hasConsent("analytics")) {
            console.log("Analytics Event:", eventName, eventData);

            if (typeof window !== "undefined" && window.gtag) {
                window.gtag("event", eventName, eventData);
            }
        }
    }, [eventName, eventData, hasConsent]);

    return <>{children}</>;
}

// Hook for tracking page views
// TODO: move in separte file in hooks folder
export function usePageView(pageName: string) {
    const { hasConsent } = useCookieConsent();

    useEffect(() => {
        if (hasConsent("analytics")) {
            console.log("Page View:", pageName);

            if (typeof window !== "undefined" && window.gtag) {
                window.gtag("config", "GA_MEASUREMENT_ID", {
                    page_title: pageName,
                    page_location: window.location.href,
                });
            }
        }
    }, [pageName, hasConsent]);
}

// Hook for tracking user interactions
// TODO: move in separte file in hooks folder
export function useInteractionTracking() {
    const { hasConsent } = useCookieConsent();

    const trackEvent = (eventName: string, eventData?: AnalyticsEventData) => {
        if (hasConsent("analytics")) {
            console.log("Interaction Event:", eventName, eventData);

            if (typeof window !== "undefined" && window.gtag) {
                window.gtag("event", eventName, eventData);
            }
        }
    };

    return { trackEvent };
}
