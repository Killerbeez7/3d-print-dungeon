import {
    doc,
    setDoc,
    onSnapshot,
    serverTimestamp,
    collection,
    getDocs,
} from "firebase/firestore";
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
import {
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider,
} from "firebase/auth";

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
    photoURL = "/user.png"
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
                uploads: [],
                likes: [],
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
    const userDocRef = doc(db, "users", uid);
    const unsubscribe = onSnapshot(
        userDocRef,
        (snapshot) => {
            if (snapshot.exists()) {
                callback(snapshot.data());
            } else {
                callback(null); // Return null if user does not exist
            }
        },
        (error) => {
            console.error("Error reading user doc:", error);
            callback(null);
        }
    );
    return unsubscribe;
};

export const getAllArtists = async () => {
    const usersCollectionRef = collection(db, "users");
    try {
        // Fetch all users
        const userDocs = await getDocs(usersCollectionRef);
        const artistsWithUploads = [];

        userDocs.forEach((doc) => {
            const userData = doc.data();
            // Check if the user has uploads (assuming `uploads` is an array in each user's doc)
            if (userData.uploads && userData.uploads.length > 0) {
                artistsWithUploads.push({
                    id: doc.id,
                    ...userData,
                });
            }
        });

        return artistsWithUploads;
    } catch (error) {
        console.error("Error fetching artists:", error);
        return []; // Return empty array if something goes wrong
    }
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
export const changePassword = async (
    currentUser,
    currentPassword,
    newPassword
) => {
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
