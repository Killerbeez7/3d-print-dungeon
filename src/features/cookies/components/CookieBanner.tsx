import { useCookies } from "../hooks/useCookies";

/**
 * CookieBanner - displays a consent banner with accept/manage options.
 */
export function CookieBanner() {
    const { consent, acceptAll, openSettings } = useCookies();
    if (consent.accepted) return null;
    return (
        <div role="dialog" aria-modal="true">
            <p>We use cookies to improve your experience. By using our site, you accept our cookie policy.</p>
            <button type="button" onClick={acceptAll}>Accept All</button>
            <button type="button" onClick={openSettings}>Manage Preferences</button>
        </div>
    );
} 