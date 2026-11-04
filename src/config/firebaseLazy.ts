import type { HttpsCallableResult } from "firebase/functions";
import type { FirebaseStorage } from "firebase/storage";

import { app } from "./firebaseConfig";

/**
 * Cloud Functions and Storage are only needed for uploads, downloads,
 * payments and a few account actions, so their SDKs load on first use
 * instead of with every page.
 */

let functionsSdk: Promise<typeof import("firebase/functions")> | null = null;
let storageSdk: Promise<typeof import("firebase/storage") & { storage: FirebaseStorage }> | null = null;
let appCheck: Promise<void> | null = null;

const appCheckSiteKey: string | undefined = import.meta.env.VITE_APP_CHECK_SITE_KEY;

/**
 * App Check proves to Firebase that calls come from this site and not from a script. It starts
 * with the Functions or Storage SDK (so pages that never call them don't load reCAPTCHA) and only
 * when the build has a reCAPTCHA Enterprise site key. Failing to start never blocks a call.
 */
const startAppCheck = () =>
  (appCheck ??= appCheckSiteKey
    ? import("firebase/app-check")
        .then(({ initializeAppCheck, ReCaptchaEnterpriseProvider }) => {
          // Local development prints a debug token to register in the Firebase console.
          if (import.meta.env.DEV) {
            (self as { FIREBASE_APPCHECK_DEBUG_TOKEN?: boolean }).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
          }
          initializeAppCheck(app, {
            provider: new ReCaptchaEnterpriseProvider(appCheckSiteKey),
            isTokenAutoRefreshEnabled: true,
          });
        })
        .catch(() => undefined)
    : Promise.resolve());

const loadFunctionsSdk = () =>
  (functionsSdk ??= Promise.all([import("firebase/functions"), startAppCheck()]).then(([sdk]) => sdk));

/** Like httpsCallable(functions, name), but the SDK loads on the first call. */
export function lazyCallable<Req = unknown, Res = unknown>(name: string, region?: string) {
  return async (data?: Req): Promise<HttpsCallableResult<Res>> => {
    const { getFunctions, httpsCallable } = await loadFunctionsSdk();
    return httpsCallable<Req, Res>(getFunctions(app, region), name)(data as Req);
  };
}

/** The Storage SDK and this app's bucket, loaded on first use. */
export const loadStorage = () =>
  (storageSdk ??= Promise.all([import("firebase/storage"), startAppCheck()]).then(([sdk]) => ({
    ...sdk,
    storage: sdk.getStorage(app),
  })));
