import { createContext, useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { getFirestore, doc, getDoc } from "firebase/firestore"; // Added Firestore for user data fetching

// Auth service functions (as in your original code)
import {
    signOutUser,
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    signInWithTwitter,
    signInWithFacebook,
} from "../services/authService";

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

const db = getFirestore(); // Firestore instance

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userData, setUserData] = useState(null); // Store additional user data (photoURL, bio, etc.)
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState("");

    // Fetch user data from Firestore
    const fetchUserData = async (uid) => {
        try {
            const userDocRef = doc(db, "users", uid); // Assuming you have a 'users' collection
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
                setUserData(userDoc.data());
            } else {
                console.error("No user data found in Firestore");
                setUserData({}); // Fallback to empty object if no data
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
            setUserData({}); // Fallback to empty object if error occurs
        }
    };

    // Listen for auth state changes (user login/logout)
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setLoading(true); // Start loading state
            if (user) {
                setCurrentUser(user); // Set user from Firebase Auth
                await fetchUserData(user.uid); // Fetch additional user data
            } else {
                setCurrentUser(null); // If no user, set to null
                setUserData(null); // Clear user data
            }
            setLoading(false); // End loading state
        });
        return () => unsubscribe();
    }, []);

    // Common error handling for auth methods
    const handleAuthError = (error, provider) => {
        console.error(`${provider} error:`, error);
        setAuthError(error.message || `Failed with ${provider}.`);
        throw error;
    };

    // Auth methods (with refactored error handling)
    const handleEmailSignUp = async (email, password) => {
        try {
            setAuthError("");
            const user = await signUpWithEmail(email, password);
            setCurrentUser(user);
            await fetchUserData(user.uid); // Fetch additional user data
        } catch (error) {
            handleAuthError(error, "Email Sign-up");
        }
    };

    const handleEmailSignIn = async (email, password) => {
        try {
            setAuthError("");
            const user = await signInWithEmail(email, password);
            setCurrentUser(user);
            await fetchUserData(user.uid);
        } catch (error) {
            handleAuthError(error, "Email Sign-in");
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            setAuthError("");
            const user = await signInWithGoogle();
            setCurrentUser(user);
            await fetchUserData(user.uid);
        } catch (error) {
            handleAuthError(error, "Google Sign-in");
        }
    };

    const handleTwitterSignIn = async () => {
        try {
            setAuthError("");
            const user = await signInWithTwitter();
            setCurrentUser(user);
            await fetchUserData(user.uid);
        } catch (error) {
            handleAuthError(error, "Twitter Sign-in");
        }
    };

    const handleFacebookSignIn = async () => {
        try {
            setAuthError("");
            const user = await signInWithFacebook();
            setCurrentUser(user);
            await fetchUserData(user.uid);
        } catch (error) {
            handleAuthError(error, "Facebook Sign-in");
        }
    };

    const handleSignOut = async () => {
        try {
            setAuthError("");
            await signOutUser();
            setCurrentUser(null);
            setUserData(null); // Clear user data on sign-out
        } catch (error) {
            handleAuthError(error, "Sign-out");
        }
    };

    const value = {
        currentUser,
        userData, // Providing user data (photoURL, bio, etc.) to components
        authError,
        handleEmailSignUp,
        handleEmailSignIn,
        handleGoogleSignIn,
        handleTwitterSignIn,
        handleFacebookSignIn,
        handleSignOut,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children} {/* Render children only when data is loaded */}
        </AuthContext.Provider>
    );
};

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
