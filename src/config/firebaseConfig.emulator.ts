import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getFunctions, Functions, connectFunctionsEmulator } from "firebase/functions";
import { getStorage, FirebaseStorage } from "firebase/storage";
import firebase_key from "../keys/firebase_key.json";

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebase_key);

// Initialize services
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);
export const functions: Functions = getFunctions(app);

// Connect Functions and Auth to emulators in development
if (process.env.NODE_ENV === "development") {
    try {
        // Connect Functions to emulator
        connectFunctionsEmulator(functions, "localhost", 5001);
        // Connect Auth to emulator
        connectAuthEmulator(auth, "http://localhost:9099");
        console.log("✅ Connected to Firebase Functions and Auth emulators (other services use production)");
    } catch (error) {
        console.log("⚠️ Emulators already connected or not available", error);
    }
}

export { app }; 