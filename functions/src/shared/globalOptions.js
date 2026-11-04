import { setGlobalOptions } from "firebase-functions/v2";

/**
 * App Check: callable functions only answer requests that come from this site (a reCAPTCHA
 * Enterprise check in the browser), not from scripts calling them directly. Switch on only after
 * the site build with VITE_APP_CHECK_SITE_KEY is live and the function logs show calls arriving
 * with a valid token ("Callable request verification passed", app: VALID); otherwise every call
 * from the site fails. See TODO.md, "App Check". The Stripe webhook is not a callable and is
 * not affected.
 */
export const ENFORCE_APP_CHECK = false;

// At most 10 instances per function. Plenty for this site, keeps a traffic
// spike from becoming a large bill, and stays inside the project's regional
// CPU quota (deploys failed with "Quota exceeded for total allowable CPU").
// Imported first in index.js so it applies before any function is defined.
setGlobalOptions({ maxInstances: 10, enforceAppCheck: ENFORCE_APP_CHECK });
