import { useCookies } from "../hooks/useCookies";

/**
 * CookieSettingsForm - allows users to manage cookie preferences.
 */
export function CookieSettingsForm() {
    const { consent, setCategory, savePreferences } = useCookies();
    return (
        <form onSubmit={e => { e.preventDefault(); savePreferences(); }}>
            <label>
                <input type="checkbox" checked={consent.essential} disabled />
                Essential Cookies (required)
            </label>
            <label>
                <input type="checkbox" checked={consent.analytics} onChange={e => setCategory("analytics", e.target.checked)} />
                Analytics Cookies
            </label>
            <label>
                <input type="checkbox" checked={consent.marketing} onChange={e => setCategory("marketing", e.target.checked)} />
                Marketing Cookies
            </label>
            <label>
                <input type="checkbox" checked={consent.payment} onChange={e => setCategory("payment", e.target.checked)} />
                Payment Cookies
            </label>
            <button type="submit">Save Preferences</button>
        </form>
    );
} 