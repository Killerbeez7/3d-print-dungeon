import {
  EmailAuthProvider,
  GoogleAuthProvider,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updatePassword,
  User as FirebaseUser,
  // UserCredential,
} from "firebase/auth";

import { doc, onSnapshot } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";

import { auth, db } from "@/config/firebaseConfig";
import { isUsernameAvailableInDB } from "../utils/authUtils";

import type { PrivateProfile } from "@/features/user/types/user";
import type { PublicProfile } from "@/features/user/profile";
import { handleAuthError } from "../utils/errorHandling";

import { functions } from "@/config/firebaseConfig";

const ensureUserDocument = httpsCallable(functions, "ensureUserDocument");

const ensureUserDoc = async () => {
  try {
    await ensureUserDocument();
  } catch (err) {
    console.error("Failed to ensure user document:", err);
  }
};

export const fetchPublicProfile = (
  uid: string,
  callback: (user: PublicProfile | null) => void
): (() => void) => {
  if (!uid) {
    console.error("No uid provided to getUserFromDatabase");
    callback(null);
    return () => {};
  }
  const userDocRef = doc(db, "users", uid, "public", "data");
  const unsubscribe = onSnapshot(
    userDocRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as PublicProfile);
      } else {
        callback(null);
      }
    },
    (error) => {
      if (error.code === "permission-denied") {
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
  password: string
): Promise<FirebaseUser> => {
  try {
    const createValidatedUser = httpsCallable(functions, "createValidatedUser");

    await createValidatedUser({
      email,
      password,
    });

    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    await ensureUserDoc();

    return userCredential.user;
  } catch (error) {
    throw handleAuthError(error, "Email Sign-up");
  }
};

export const signInWithEmail = async (
  email: string,
  password: string
): Promise<FirebaseUser> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    await ensureUserDoc();
    return userCredential.user;
  } catch (error) {
    throw handleAuthError(error, "Email Sign-in");
  }
};

export const signInWithGoogle = async (): Promise<FirebaseUser> => {
  try {
    const provider = new GoogleAuthProvider();
    provider.addScope("email");
    provider.addScope("profile");

    const { user } = await signInWithPopup(auth, provider);
    await ensureUserDoc();
    return user;
  } catch (error) {
    throw handleAuthError(error, "Google Sign-in");
  }
};

export const changePassword = async (
  currentUser: FirebaseUser,
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  if (!currentUser.email) {
    throw new Error("Password change requires an email account");
  }

  try {
    const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);

    await reauthenticateWithCredential(currentUser, credential);

    await updatePassword(currentUser, newPassword);
  } catch (error) {
    throw handleAuthError(error, "Password Change");
  }
};

export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    throw handleAuthError(error, "Password reset");
  }
};

export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    throw handleAuthError(error, "Sign-Out");
  }
};

export const updateUserUsername = async (
  uid: string,
  newUsername: string
): Promise<void> => {
  try {
    const isAvailable = await isUsernameAvailableInDB(newUsername);
    if (!isAvailable) {
      throw new Error("Username is already taken");
    }
    const updateUsername = httpsCallable(functions, "updateUsername");
    await updateUsername({ username: newUsername });
  } catch (error) {
    console.error("Error updating username:", error);
    throw error;
  }
};

export const fetchPrivateProfile = (
  uid: string,
  callback: (profile: PrivateProfile | null) => void
): (() => void) => {
  if (!uid) {
    console.error("No uid provided to fetchPrivateProfile");
    callback(null);
    return () => {};
  }
  const privateDocRef = doc(db, "users", uid, "private", "data");
  const unsubscribe = onSnapshot(
    privateDocRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const raw = snapshot.data();

        const transformedData = {
          ...raw,
          phoneNumber: raw.phoneNumber ?? undefined,
          dateOfBirth: raw.dateOfBirth ?? undefined,
          suspensionReason: raw.suspensionReason ?? undefined,
          lastPasswordChange: raw.lastPasswordChange ?? undefined,
          stripeCustomerId: raw.stripeCustomerId ?? undefined,
        };
        callback(transformedData as PrivateProfile);
      } else {
        callback(null);
      }
    },
    (error) => {
      if (error.code === "permission-denied") {
        callback(null);
      } else {
        console.error("Error reading private profile:", error);
        callback(null);
      }
    }
  );
  return unsubscribe;
};
