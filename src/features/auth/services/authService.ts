import { doc, setDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../../config/firebaseConfig";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    FacebookAuthProvider,
    TwitterAuthProvider,
    GoogleAuthProvider,
    signInWithPopup,
    updateProfile,
    signOut,
    User as FirebaseUser,
    UserCredential,
} from "firebase/auth";
import {
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider,
} from "firebase/auth";
import { STATIC_ASSETS } from "../../../config/assetsConfig";
import type { RawUserData } from "@/types/user";

export const getHighResPhotoURL = (photoURL?: string | null): string => {
    if (photoURL && photoURL.includes("googleusercontent.com")) {
        return photoURL.replace(/=s\d+-c/, "=s512-c");
    }
    return photoURL || "/user.png";
};


export const addUserToDatabase = async (
    uid: string,
    email: string | null | undefined,
    displayName: string = "Anonymous",
    photoURL: string = STATIC_ASSETS.DEFAULT_AVATAR
): Promise<void> => {
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


export const getUserFromDatabase = (
    uid: string,
    callback: (user: RawUserData | null) => void
): (() => void) => {
    if (!uid) {
        console.error("No uid provided to getUserFromDatabase");
        callback(null);
        return () => { };
    }
    const userDocRef = doc(db, "users", uid);
    const unsubscribe = onSnapshot(
        userDocRef,
        (snapshot) => {
            if (snapshot.exists()) {
                callback(snapshot.data() as RawUserData);
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


export const signUpWithEmail = async (
    email: string,
    password: string
): Promise<FirebaseUser> => {
    try {
        const userCredential: UserCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );
        const user = userCredential.user;
        await updateProfile(user, {
            displayName: "Anonymous",
        });
        await addUserToDatabase(user.uid, email ?? undefined, user.displayName ?? undefined);
        return user;
    } catch (error: unknown) {
        const errMsg = error instanceof Error ? error.message : String(error);
        console.error("Error signing up with email:", error);
        throw new Error(errMsg);
    }
};


export const signInWithEmail = async (
    email: string,
    password: string
): Promise<FirebaseUser> => {
    try {
        const userCredential: UserCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error: unknown) {
        const errMsg = error instanceof Error ? error.message : String(error);
        console.error("Error signing in with email:", error);
        throw new Error(errMsg);
    }
};


export const signInWithGoogle = async (): Promise<FirebaseUser> => {
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
    } catch (error: unknown) {
        const errMsg = error instanceof Error ? error.message : String(error);
        console.error("Error with Google Sign-In:", error);
        throw new Error(errMsg);
    }
};


export const signInWithFacebook = async (): Promise<FirebaseUser> => {
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
    } catch (error: unknown) {
        const errMsg = error instanceof Error ? error.message : String(error);
        console.error("Error with Facebook Sign-In:", error);
        throw new Error(errMsg);
    }
};


export const signInWithTwitter = async (): Promise<FirebaseUser> => {
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
    } catch (error: unknown) {
        const errMsg = error instanceof Error ? error.message : String(error);
        console.error("Error with Twitter Sign-In:", error);
        throw new Error(errMsg);
    }
};


export const changePassword = async (
    currentUser: FirebaseUser,
    currentPassword: string,
    newPassword: string
): Promise<void> => {
    try {
        const credential = EmailAuthProvider.credential(
            currentUser.email!,
            currentPassword
        );
        await reauthenticateWithCredential(currentUser, credential);
        await updatePassword(currentUser, newPassword);
    } catch (error: unknown) {
        const errMsg = error instanceof Error ? error.message : String(error);
        console.error("Error updating password:", error);
        throw new Error(errMsg);
    }
};


export const signOutUser = async (): Promise<void> => {
    try {
        await signOut(auth);
    } catch (error: unknown) {
        const errMsg = error instanceof Error ? error.message : String(error);
        console.error("Error signing out:", error);
        throw new Error(errMsg);
    }
};
