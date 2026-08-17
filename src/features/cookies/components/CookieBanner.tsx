import { useState, useEffect } from "react";

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
        <div
          role="region"
          aria-label="Cookie preferences"
          className="fixed bottom-0 left-0 right-0 z-50 border-t border-br-secondary bg-section p-4 shadow-lg"
        >
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
              <div className="flex-1">
                <h3 className="mb-2 text-lg font-semibold text-txt-primary">
                  Cookie Preferences
                </h3>

                <p className="text-sm text-txt-secondary">
                  We use essential cookies to keep the website working. With your
                  permission, we can also use optional cookies for analytics, personalized
                  content, and other features.
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={declineAll}
                  className="rounded-lg bg-page px-4 py-2 text-sm text-white transition-colors hover:bg-page/90"
                >
                  Decline Non-Essentials
                </button>

                <button
                  type="button"
                  onClick={() => setShowSettingsModal(true)}
                  className="rounded-lg border border-br-secondary px-4 py-2 text-sm text-txt-secondary transition-colors hover:border-br-primary hover:text-txt-primary"
                >
                  Manage Preferences
                </button>

                <button
                  type="button"
                  onClick={acceptAll}
                  className="rounded-lg border border-br-secondary px-4 py-2 text-sm text-txt-secondary transition-colors hover:border-br-primary hover:text-txt-primary"
                >
                  Accept All
                </button>
              </div>
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
