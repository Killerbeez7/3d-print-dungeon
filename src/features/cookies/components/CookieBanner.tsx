import { useState, useEffect } from "react";

import { Link } from "react-router-dom";

import { Button } from "@/components";
import { ROUTES } from "@/constants/routeConstants";

import { useCookies } from "../hooks/useCookies";
import { CookieSettingsModal } from "./CookieSettingsModal";

export function CookieBanner() {
  const { consent, acceptAll, declineAll } = useCookies();
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  useEffect(() => {
    const handleOpenSettings = () => {
      setShowSettingsModal(true);
    };

    window.addEventListener("openCookieSettings", handleOpenSettings);

    return () => {
      window.removeEventListener("openCookieSettings", handleOpenSettings);
    };
  }, []);

  const showBanner = !consent.accepted;

  return (
    <>
      {showBanner && (
        // Pinned to the bottom edge, so it stays on --bg-page for iPhone Safari's bar colour.
        <div
          role="region"
          aria-label="Cookie preferences"
          className="fixed inset-x-0 bottom-0 z-50 border-t border-br-secondary bg-page pb-[env(safe-area-inset-bottom)]"
        >
          <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-4 py-4 sm:px-6 md:flex-row md:items-center md:gap-8 lg:px-8">
            <div className="flex-1">
              <p className="label-mono text-accent">Cookies</p>
              <p className="mt-1 text-sm leading-relaxed text-txt-secondary">
                We use essential cookies to keep the website working. With your permission, we
                can also use optional cookies for analytics, personalized content, and other
                features.{" "}
                <Link to={ROUTES.COOKIE_POLICY} className="font-medium text-accent underline-offset-4 hover:underline">
                  Cookie policy
                </Link>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0">
              <Button variant="secondary" size="sm" onClick={declineAll}>
                Reject optional
              </Button>
              <Button variant="secondary" size="sm" onClick={acceptAll}>
                Accept all
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettingsModal(true)}
                className="col-span-2"
              >
                Manage
              </Button>
            </div>
          </div>
        </div>
      )}

      <CookieSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />
    </>
  );
}
