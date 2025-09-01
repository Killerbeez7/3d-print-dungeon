import { useEffect } from "react";
import { useCookies } from "./useCookies";

export function useCookieCheck(feature: 'analytics' | 'marketing' | 'payment') {
    const { consent, checkCookiesNeeded } = useCookies();

    useEffect(() => {
        const cookieCheck = checkCookiesNeeded(feature);
        
        if (cookieCheck.needed) {
            // Show cookie banner or modal for this feature
            console.log(`Cookies needed for ${feature} feature`);
            
            // You can dispatch a custom event to show the cookie banner
            window.dispatchEvent(new CustomEvent('showCookieBanner', {
                detail: { feature: cookieCheck.type }
            }));
        }
    }, [feature, consent, checkCookiesNeeded]);

    return {
        hasConsent: consent[feature],
        needsConsent: !consent[feature] && consent.accepted
    };
}
