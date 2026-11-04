import { useEffect } from "react";
import { useCookieConsent } from "@/features/cookies";

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
