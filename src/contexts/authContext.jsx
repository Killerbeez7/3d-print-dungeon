import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebaseConfig";

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

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState("");

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user ? { ...user } : null);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleEmailSignUp = async (email, password) => {
        try {
            setAuthError("");
            const user = await signUpWithEmail(email, password);
            setCurrentUser(user);
        } catch (error) {
            console.error("Sign-up error:", error);
            setAuthError(
                error.message || "Failed to sign up. Please try again."
            );
            throw error;
        }
    };

    const handleEmailSignIn = async (email, password) => {
        try {
            setAuthError("");
            const user = await signInWithEmail(email, password);
            setCurrentUser(user);
        } catch (error) {
            console.error("Sign-in error:", error);
            setAuthError(
                error.message || "Failed to sign in. Please try again."
            );
            throw error;
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            setAuthError("");
            const user = await signInWithGoogle();
            setCurrentUser(user);
        } catch (error) {
            console.error("Google sign-in error:", error);
            setAuthError(error.message || "Failed to sign in with Google.");
            throw error;
        }
    };

    const handleTwitterSignIn = async () => {
        try {
            setAuthError("");
            const user = await signInWithTwitter();
            setCurrentUser(user);
        } catch (error) {
            console.error("Twitter sign-in error:", error);
            setAuthError(error.message || "Failed to sign in with Twitter.");
            throw error;
        }
    };

    const handleFacebookSignIn = async () => {
        try {
            setAuthError("");
            const user = await signInWithFacebook();
            setCurrentUser(user);
        } catch (error) {
            console.error("Facebook sign-in error:", error);
            setAuthError(error.message || "Failed to sign in with Facebook.");
            throw error;
        }
    };

    const handleSignOut = async () => {
        try {
            setAuthError("");
            await signOutUser();
            setCurrentUser(null);
        } catch (error) {
            console.error("Logout error:", error);
            setAuthError(error.message || "Failed to log out.");
            throw error;
        }
    };

    const value = {
        currentUser,
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
            {!loading && children}
        </AuthContext.Provider>
    );
};
