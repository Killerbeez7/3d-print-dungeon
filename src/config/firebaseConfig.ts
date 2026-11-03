import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import firebase_key from "../keys/firebase_key.json";

/**
 * Google sign-in finishes on a handler page on the auth domain. On the default
 * print-dungeon-3d.firebaseapp.com that page is a different site, and Safari
 * (and other browsers that partition storage) keeps its storage apart, so the
 * sign-in fails with "missing initial state". Firebase Hosting serves the same
 * handler on every domain it hosts, so on those the site's own domain is used.
 * Each of these domains needs https://<domain>/__/auth/handler as an authorised
 * redirect URI on the Google OAuth client.
 */
const OWN_HOSTING_DOMAIN = /^(printdungeon\.com|print-dungeon-3d(--[a-z0-9-]+)?\.web\.app)$/;

const authDomain =
  typeof window !== "undefined" && OWN_HOSTING_DOMAIN.test(window.location.hostname)
    ? window.location.hostname
    : firebase_key.authDomain;

export const app = initializeApp({ ...firebase_key, authDomain });
export const auth = getAuth(app);
export const db = getFirestore(app);
// Storage and Cloud Functions load on first use: see ./firebaseLazy.ts.
