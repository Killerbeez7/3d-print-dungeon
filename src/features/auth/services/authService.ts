import { doc, setDoc, getDoc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/config/firebaseConfig";
import { isUsernameAvailableInDB } from "../utils/authUtils";
import {
    signInWithEmailAndPassword,
    FacebookAuthProvider,
    TwitterAuthProvider,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    User as FirebaseUser,
    UserCredential,
} from "firebase/auth";
import {
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider,
} from "firebase/auth";
import type { RawUserData } from "@/features/user/types/user";
import { handleAuthError } from "../utils/errorHandling";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/config/firebaseConfig";


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
                callback(null);
            }
        },
        (error) => {
            // Handle permission denied errors gracefully during sign out
            if (error.code === "permission-denied") {
                // Silent handling for expected sign-out behavior
                callback(null);
            } else {
                console.error("Error reading user doc:", error);
                callback(null);
            }
        }
    );
    return unsubscribe;
};

export const signUpWithEmail = async (
    email: string,
    password: string,
): Promise<FirebaseUser> => {
    try {
        console.log("🔄 Starting sign-up process for:", email);

        // Use atomic backend validation and user creation
        const createValidatedUser = httpsCallable(functions, "createValidatedUser");
        console.log("📞 Calling createValidatedUser function...");

        const result = await createValidatedUser({
            email,
            password
        });

        console.log("✅ User created successfully:", result.data);

        // Sign in the user after successful creation
        console.log("🔐 Signing in user after creation...");
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("✅ User signed in successfully:", userCredential.user.uid);

        return userCredential.user;
    } catch (error: unknown) {
        console.error("❌ Error in signUpWithEmail:", error);
        const authError = handleAuthError(error, "Email Sign-up");
        console.error("Error signing up with email:", error);
        throw authError;
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
        const authError = handleAuthError(error, "Email Sign-in");
        console.error("Error signing in with email:", error);
        throw authError;
    }
};

export const signInWithGoogle = async (): Promise<FirebaseUser> => {
    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Check if user already exists in database
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            // New user - backend will handle user creation with auto-generated username
            console.log("🆕 New user, backend will handle user creation");
        } else {
            // User exists - backend already handled this
            console.log("✅ Existing user found");
        }

        return user;
    } catch (error: unknown) {
        const authError = handleAuthError(error, "Google Sign-in");
        console.error("Error with Google Sign-In:", error);
        throw authError;
    }
};

export const signInWithFacebook = async (): Promise<FirebaseUser> => {
    try {
        const provider = new FacebookAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Check if user already exists in database
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            // New user - backend will handle user creation with auto-generated username
            console.log("🆕 New user, backend will handle user creation");
        } else {
            // User exists - backend already handled this
            console.log("✅ Existing user found");
        }

        return user;
    } catch (error: unknown) {
        const authError = handleAuthError(error, "Facebook Sign-in");
        console.error("Error with Facebook Sign-In:", error);
        throw authError;
    }
};

export const signInWithTwitter = async (): Promise<FirebaseUser> => {
    try {
        const provider = new TwitterAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Check if user already exists in database
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            // New user - backend will handle user creation with auto-generated username
            console.log("🆕 New user, backend will handle user creation");
        } else {
            // User exists - backend already handled this
            console.log("✅ Existing user found");
        }

        return user;
    } catch (error: unknown) {
        const authError = handleAuthError(error, "Twitter Sign-in");
        console.error("Error with Twitter Sign-in:", error);
        throw authError;
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
        const authError = handleAuthError(error, "Password Change");
        console.error("Error updating password:", error);
        throw authError;
    }
};

export const signOutUser = async (): Promise<void> => {
    try {
        await signOut(auth);
    } catch (error: unknown) {
        const authError = handleAuthError(error, "Sign-out");
        console.error("Error signing out:", error);
        throw authError;
    }
};

export const updateUserUsername = async (uid: string, newUsername: string): Promise<void> => {
    try {
        // Check if username is available
        const isAvailable = await isUsernameAvailableInDB(newUsername);
        if (!isAvailable) {
            throw new Error("Username is already taken");
        }

        const userDocRef = doc(db, "users", uid);
        await setDoc(
            userDocRef,
            { username: newUsername },
            { merge: true }
        );
    } catch (error) {
        console.error("Error updating username:", error);
        throw error;
    }
};



