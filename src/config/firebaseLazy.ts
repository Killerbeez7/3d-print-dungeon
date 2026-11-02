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

const loadFunctionsSdk = () => (functionsSdk ??= import("firebase/functions"));

/** Like httpsCallable(functions, name), but the SDK loads on the first call. */
export function lazyCallable<Req = unknown, Res = unknown>(name: string, region?: string) {
  return async (data?: Req): Promise<HttpsCallableResult<Res>> => {
    const { getFunctions, httpsCallable } = await loadFunctionsSdk();
    return httpsCallable<Req, Res>(getFunctions(app, region), name)(data as Req);
  };
}

/** The Storage SDK and this app's bucket, loaded on first use. */
export const loadStorage = () =>
  (storageSdk ??= import("firebase/storage").then((sdk) => ({ ...sdk, storage: sdk.getStorage(app) })));
