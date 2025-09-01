import { useCookies } from "../hooks/useCookies";
import { useState, useEffect } from "react";
import { CookieSettingsModal } from "./CookieSettingsModal";

export function CookieBanner() {
    const { consent, acceptAll, declineAll } = useCookies();
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [forceShow, setForceShow] = useState(false);

    // Listen for custom event to open settings modal
    useEffect(() => {
        const handleOpenSettings = () => {
            setShowSettingsModal(true);
        };

        const handleShowBanner = (event: CustomEvent) => {
            console.log("Cookie banner requested for feature:", event.detail.feature);
            setForceShow(true);
        };

        window.addEventListener("openCookieSettings", handleOpenSettings);
        window.addEventListener("showCookieBanner", handleShowBanner as EventListener);

        return () => {
            window.removeEventListener("openCookieSettings", handleOpenSettings);
            window.removeEventListener(
                "showCookieBanner",
                handleShowBanner as EventListener
            );
        };
    }, []);

    // Show banner if user hasn't made a choice yet OR if forced to show
    if (consent.accepted && !forceShow) return null;

    return (
        <>
            <div
                role="dialog"
                aria-modal="true"
                className="fixed bottom-0 left-0 right-0 z-50 bg-bg-secondary border-t border-br-secondary p-4 shadow-lg"
            >
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-txt-primary mb-2">
                                    Cookie Preferences
                                </h3>
                                {forceShow && (
                                    <button
                                        onClick={() => setForceShow(false)}
                                        className="text-txt-secondary hover:text-txt-primary transition-colors text-xl ml-4"
                                        title="Close banner"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                            <p className="text-txt-secondary text-sm">
                                We use cookies to improve your experience, analyze site
                                traffic, and personalize content. By continuing to use our
                                site, you consent to our use of cookies.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    declineAll();
                                    setForceShow(false);
                                }}
                                className="px-4 py-2 text-sm bg-primary text-white hover:bg-primary/90 transition-colors rounded-lg"
                            >
                                Decline Non-Essentials
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowSettingsModal(true)}
                                className="px-4 py-2 text-sm border border-br-secondary text-txt-secondary hover:text-txt-primary hover:border-br-primary transition-colors rounded-lg"
                            >
                                Manage Preferences
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    acceptAll();
                                    setForceShow(false);
                                }}
                                className="px-4 py-2 text-sm border border-br-secondary text-txt-secondary hover:text-txt-primary hover:border-br-primary transition-colors rounded-lg"
                            >
                                Accept All
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <CookieSettingsModal
                isOpen={showSettingsModal}
                onClose={() => setShowSettingsModal(false)}
            />
        </>
    );
}
