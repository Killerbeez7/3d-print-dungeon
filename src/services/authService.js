import { doc, setDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    FacebookAuthProvider,
    TwitterAuthProvider,
    GoogleAuthProvider,
    signInWithPopup,
    updateProfile,
    signOut,
} from "firebase/auth";

// upscale profile picture
export const getHighResPhotoURL = (photoURL) => {
    if (photoURL && photoURL.includes("googleusercontent.com")) {
        return photoURL.replace(/=s\d+-c/, "=s512-c");
    }
    return photoURL || "https://example.com/default-profile.png";
};

// add user to DB
export const addUserToDatabase = async (
    uid,
    email,
    displayName = "Anonymous",
    photoURL = "https://example.com/default-profile.png"
) => {
    const userDocRef = doc(db, "users", uid);
    try {
        await setDoc(
            userDocRef,
            {
                displayName,
                email,
                photoURL,
                createdAt: serverTimestamp(),
            },
            { merge: true }
        );
    } catch (error) {
        console.error("Error adding user to Firestore:", error);
        throw error;
    }
};

// get user from DB
export const getUserFromDatabase = (uid, callback) => {
    const userDocRef = doc(db, "users", uid);
    const unsubscribe = onSnapshot(
        userDocRef,
        (snapshot) => {
            if (snapshot.exists()) {
                callback(snapshot.data());
            } else {
                callback(null);
            }
        },
        (error) => {
            console.error("Error reading user doc:", error);
            callback(null);
        }
    );
    return unsubscribe;
};

// Email Sign Up
export const signUpWithEmail = async (email, password) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );
        const user = userCredential.user;

        await updateProfile(user, {
            displayName: "Anonymous",
        });

        await addUserToDatabase(user.uid, email, user.displayName);
        return user;
    } catch (error) {
        console.error("Error signing up with email:", error);
        throw new Error(error.message);
    }
};

// Email Sign In
export const signInWithEmail = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(
            auth,
            email,
            password
        );
        return userCredential.user;
    } catch (error) {
        console.error("Error signing in with email:", error);
        throw new Error(error.message);
    }
};

// Google Sign In
export const signInWithGoogle = async () => {
    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        const upscalePhotoURL = getHighResPhotoURL(user.photoURL);

        await addUserToDatabase(
            user.uid,
            user.email,
            user.displayName || "Annonymous",
            upscalePhotoURL
        );

        return user;
    } catch (error) {
        console.error("Error with Google Sign-In:", error);
        throw new Error(error.message);
    }
};

// Facebook Sign In
export const signInWithFacebook = async () => {
    try {
        const provider = new FacebookAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        const upscalePhotoURL = getHighResPhotoURL(user.photoURL);
        await addUserToDatabase(
            user.uid,
            user.email,
            user.displayName || "Facebook User",
            upscalePhotoURL
        );

        return user;
    } catch (error) {
        console.error("Error with Facebook Sign-In:", error);
        throw new Error(error.message);
    }
};

// Twitter Sign In
export const signInWithTwitter = async () => {
    try {
        const provider = new TwitterAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        const upscalePhotoURL = getHighResPhotoURL(user.photoURL);
        await addUserToDatabase(
            user.uid,
            user.email,
            user.displayName || "Twitter User",
            upscalePhotoURL
        );

        return user;
    } catch (error) {
        console.error("Error with Twitter Sign-In:", error);
        throw new Error(error.message);
    }
};

// Sign Out
export const signOutUser = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Error signing out:", error);
        throw new Error(error.message);
    }
};
