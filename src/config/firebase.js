import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
    apiKey: "AIzaSyCoi2MXjhLexZrM9ele_vyl9wBh7_QQlVs",
    authDomain: "print-dungeon-3d.firebaseapp.com",
    projectId: "print-dungeon-3d",
    storageBucket: "print-dungeon-3d.firebasestorage.app",
    messagingSenderId: "211931434725",
    appId: "1:211931434725:web:34144ba859e9e8434b4e0c",
    measurementId: "G-LMBWGFK6TF",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

export { app }; 