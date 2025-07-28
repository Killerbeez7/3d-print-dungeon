import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useCookies } from "@/features/policies/hooks/useCookies";
import { CookieCategories } from "@/features/policies/types/cookies";

interface CookieConsentRouteProps {
    children: ReactNode;
    requiredConsent: CookieCategories[];
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
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
                        <div className="bg-bg-secondary rounded-xl shadow-2xl max-w-md w-full mx-4 p-6 border border-br-primary">
                            <h2 className="text-xl font-bold text-txt-primary mb-4">
                                Cookie Consent Required
                            </h2>
                            <p className="text-txt-secondary mb-6">
                                This feature requires your consent for the following
                                cookies:{" "}
                                <span className="font-semibold">
                                    {requiredConsent.join(", ")}
                                </span>
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        const event = new CustomEvent(
                                            "openCookieSettings"
                                        );
                                        window.dispatchEvent(event);
                                    }}
                                    className="flex-1 px-4 py-2 text-sm border border-br-secondary text-txt-secondary hover:text-txt-primary hover:border-br-primary transition-colors rounded-lg"
                                >
                                    Manage Cookies
                                </button>
                                <button
                                    onClick={() => (window.location.href = fallbackPath)}
                                    className="flex-1 px-4 py-2 text-sm bg-primary text-white hover:bg-primary/90 transition-colors rounded-lg"
                                >
                                    Go Back
                                </button>
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
