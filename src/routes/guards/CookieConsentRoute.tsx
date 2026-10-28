import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { Button } from "@/components";
import { useCookies } from "@/features/cookies";
import { CookieCategory } from "@/features/cookies";

interface CookieConsentRouteProps {
  children: ReactNode;
  requiredConsent: CookieCategory[];
  fallbackPath?: string;
  showBanner?: boolean;
}

export function CookieConsentRoute({
  children,
  requiredConsent,
  fallbackPath = "/",
  showBanner = true,
}: CookieConsentRouteProps) {
  const { consent } = useCookies();

  const hasRequiredConsent = requiredConsent.every((category) => consent[category]);

  if (!hasRequiredConsent) {
    if (showBanner) {
      return (
        <div className="relative">
          {children}
          <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-surface-overlay backdrop-blur-sm md:items-center md:p-6">
            <div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="consent-required-title"
              className="auth-panel w-full max-w-md rounded-t-2xl border border-br-secondary bg-surface-card p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-popover md:rounded-xl"
            >
              <p className="label-mono text-accent">Cookies</p>
              <h2 id="consent-required-title" className="mt-1 text-xl font-bold">
                This feature needs your consent
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-txt-secondary">
                It uses these cookies:{" "}
                <span className="font-semibold text-txt-primary">{requiredConsent.join(", ")}</span>
              </p>
              <div className="mt-6 grid grid-cols-2 gap-2">
                <Button variant="secondary" onClick={() => (window.location.href = fallbackPath)}>
                  Go back
                </Button>
                <Button onClick={() => window.dispatchEvent(new CustomEvent("openCookieSettings"))}>
                  Manage cookies
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
}
