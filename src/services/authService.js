import { doc, setDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../config/firebase";
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
import {
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider,
} from "firebase/auth";
import { STATIC_ASSETS } from "../config/assetsConfig";
// upscale profile picture
export const getHighResPhotoURL = (photoURL) => {
    if (photoURL && photoURL.includes("googleusercontent.com")) {
        return photoURL.replace(/=s\d+-c/, "=s512-c");
    }
    return photoURL || "/user.png";
};

// Add user to Firestore
export const addUserToDatabase = async (
    uid,
    email,
    displayName = "Anonymous",
    photoURL = STATIC_ASSETS.DEFAULT_AVATAR
) => {
    const userDocRef = doc(db, "users", uid);
    try {
        await setDoc(
            userDocRef,
            {
                displayName,
                searchableName: displayName.toLowerCase(),
                email,
                photoURL,
                createdAt: serverTimestamp(),
                uploads: [],
            },
            { merge: true }
        );
    } catch (error) {
        console.error("Error adding user to Firestore:", error);
        throw error;
    }
};

// Get user from Firestore
export const getUserFromDatabase = (uid, callback) => {
    if (!uid) {
        console.error("No uid provided to getUserFromDatabase");
        callback(null);
        return () => {}; // Return empty cleanup function
    }

    const userDocRef = doc(db, "users", uid);
    const unsubscribe = onSnapshot(
        userDocRef,
        (snapshot) => {
            if (snapshot.exists()) {
                callback(snapshot.data());
            } else {
                console.log(`No user document found for uid: ${uid}`);
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
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
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
            user.displayName || "Anonymous",
            upscalePhotoURL || "/user.png"
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
            upscalePhotoURL || "/user.png"
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
            upscalePhotoURL || "/user.png"
        );

        return user;
    } catch (error) {
        console.error("Error with Twitter Sign-In:", error);
        throw new Error(error.message);
    }
};

// Function to change password
export const changePassword = async (currentUser, currentPassword, newPassword) => {
    try {
        // Reauthenticate the user with their current password
        const credential = EmailAuthProvider.credential(
            currentUser.email,
            currentPassword
        );
        await reauthenticateWithCredential(currentUser, credential);

        // Update the password
        await updatePassword(currentUser, newPassword);
    } catch (error) {
        console.error("Error updating password:", error);
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
