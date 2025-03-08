import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCoi2MXjhLexZrM9ele_vyl9wBh7_QQlVs",
    authDomain: "print-dungeon-3d.firebaseapp.com",
    projectId: "print-dungeon-3d",
    storageBucket: "print-dungeon-3d.firebasestorage.app",
    messagingSenderId: "211931434725",
    appId: "1:211931434725:web:34144ba859e9e8434b4e0c",
    measurementId: "G-LMBWGFK6TF",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
