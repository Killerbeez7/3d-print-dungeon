import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export const AuthService = {
    async signUp(email, password) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Store user in DB
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                email: user.email,
            });

            return user;
        } catch (error) {
            throw new Error(error.message);
        }
    },

    async signIn(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            return userCredential.user;
        } catch (error) {
            throw new Error(error.message);
        }
    },

    async signOut() {
        try {
            await signOut(auth);
        } catch (error) {
            throw new Error(error.message);
        }
    },

    listenForAuthChanges(callback) {
        return onAuthStateChanged(auth, callback);
    },
};
