import type { ReactNode } from "react";
import { Button } from "@/components";
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
        <Button variant="secondary" size="sm" onClick={openSettings} className="mt-4">
          Manage cookie preferences
        </Button>
      )}
    </>
  );
}
