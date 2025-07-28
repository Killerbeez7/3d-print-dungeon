import { ReactNode, useState } from "react";
import { useCookieConsent } from "../hooks/useCookieConsent";
import { CookieCategories } from "../types/cookies";

interface ConsentRequiredFeatureProps {
    children: ReactNode;
    requiredConsent: CookieCategories[];
    fallbackContent?: ReactNode;
    showSettingsButton?: boolean;
    className?: string;
}

export function ConsentRequiredFeature({ 
    children, 
    requiredConsent, 
    fallbackContent,
    showSettingsButton = true,
    className = ""
}: ConsentRequiredFeatureProps) {
    const { hasConsent, getMissingConsent } = useCookieConsent();
    const [showSettings, setShowSettings] = useState(false);

    const hasRequiredConsent = hasConsent(requiredConsent);
    const missingConsent = getMissingConsent(requiredConsent);

    if (hasRequiredConsent) {
        return <div className={className}>{children}</div>;
    }

    if (fallbackContent) {
        return <div className={className}>{fallbackContent}</div>;
    }

    return (
        <div className={`bg-bg-secondary border border-br-secondary rounded-lg p-6 ${className}`}>
            <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-br-secondary rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-txt-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>
                
                <h3 className="text-lg font-semibold text-txt-primary mb-2">
                    Cookie Consent Required
                </h3>
                
                <p className="text-txt-secondary mb-4">
                    This feature requires your consent for:{" "}
                    <span className="font-semibold text-txt-primary">
                        {missingConsent.join(", ")}
                    </span>
                </p>

                {showSettingsButton && (
                    <button
                        onClick={() => setShowSettings(true)}
                        className="px-4 py-2 bg-primary text-white hover:bg-primary/90 transition-colors rounded-lg"
                    >
                        Manage Cookie Settings
                    </button>
                )}
            </div>

            {showSettings && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
                    <div className="bg-bg-secondary rounded-xl shadow-2xl max-w-md w-full mx-4 p-6 border border-br-primary">
                        <h2 className="text-xl font-bold text-txt-primary mb-4">
                            Cookie Settings
                        </h2>
                        <p className="text-txt-secondary mb-6">
                            To use this feature, you need to accept the following cookies:{" "}
                            <span className="font-semibold">
                                {missingConsent.join(", ")}
                            </span>
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    const event = new CustomEvent("openCookieSettings");
                                    window.dispatchEvent(event);
                                    setShowSettings(false);
                                }}
                                className="flex-1 px-4 py-2 text-sm border border-br-secondary text-txt-secondary hover:text-txt-primary hover:border-br-primary transition-colors rounded-lg"
                            >
                                Manage Cookies
                            </button>
                            <button
                                onClick={() => setShowSettings(false)}
                                className="flex-1 px-4 py-2 text-sm bg-primary text-white hover:bg-primary/90 transition-colors rounded-lg"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 