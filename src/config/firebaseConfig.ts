import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, Firestore, connectFirestoreEmulator } from "firebase/firestore";
import { getFunctions, Functions, connectFunctionsEmulator } from "firebase/functions";
import { getStorage, FirebaseStorage, connectStorageEmulator } from "firebase/storage";
import firebase_key from "../keys/firebase_key.json";

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebase_key);

// Initialize services
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);
export const functions: Functions = getFunctions(app);

// Connect to emulators in development
if (process.env.NODE_ENV === "development") {
    try {
        connectAuthEmulator(auth, "http://localhost:9099");
        connectFirestoreEmulator(db, "localhost", 8080);
        connectFunctionsEmulator(functions, "localhost", 5001);
        connectStorageEmulator(storage, "localhost", 9199);
        console.log("✅ Connected to Firebase emulators");
    } catch (error) {
        console.log("⚠️ Emulators already connected or not available", error);
    }
}

export { app }; 