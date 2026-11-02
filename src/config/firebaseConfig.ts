import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import firebase_key from "../keys/firebase_key.json";

export const app = initializeApp(firebase_key);
export const auth = getAuth(app);
export const db = getFirestore(app);
// Storage and Cloud Functions load on first use: see ./firebaseLazy.ts.
