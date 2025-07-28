import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { CookieConsentRoute } from "@/routes/guards/CookieConsentRoute";
import { getRouteConsentRequirements } from "../config/consentConfig";

interface ConsentProtectedRouteProps {
    children: ReactNode;
    route?: string;
}

export function ConsentProtectedRoute({ children, route }: ConsentProtectedRouteProps) {
    const location = useLocation();
    const currentRoute = route || location.pathname;

    const consentRequirements = getRouteConsentRequirements(currentRoute);

    if (!consentRequirements) {
        return <>{children}</>;
    }

    return (
        <CookieConsentRoute
            requiredConsent={consentRequirements.requiredConsent}
            fallbackPath={consentRequirements.fallbackPath}
            showBanner={true}
        >
            {children}
        </CookieConsentRoute>
    );
}
