import type { ReactNode } from "react";
import { useCookies } from "../hooks/useCookies";
import { useCookieConsent } from "../hooks/useCookieConsent";
import type { CookieCategory } from "../types/cookies";

interface ConsentRequiredFeatureProps {
  requiredConsent: CookieCategory[];
  fallbackContent: ReactNode;
  showSettingsButton?: boolean;
  children: ReactNode;
}

export function ConsentRequiredFeature({
  requiredConsent,
  fallbackContent,
  showSettingsButton = false,
  children,
}: ConsentRequiredFeatureProps) {
  const { hasConsent } = useCookieConsent();
  const { openSettings } = useCookies();

  if (hasConsent(requiredConsent)) {
    return <>{children}</>;
  }

  return (
    <>
      {fallbackContent}

      {showSettingsButton && (
        <button
          type="button"
          onClick={openSettings}
          className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
        >
          Manage Cookie Preferences
        </button>
      )}
    </>
  );
}
