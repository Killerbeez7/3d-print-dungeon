import { createContext, useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebase";
import { getFirestore, doc, getDoc } from "firebase/firestore"; // Added Firestore for user data fetching
import { isAdmin as checkIsAdmin } from "../services/adminService";

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
    const [isAdmin, setIsAdmin] = useState(false);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(false);

    // Check maintenance mode
    const checkMaintenanceMode = async () => {
        try {
            const settingsRef = doc(db, "settings", "global");
            const settingsDoc = await getDoc(settingsRef);
            if (settingsDoc.exists()) {
                const maintenance = settingsDoc.data().siteMaintenanceMode || false;
                setMaintenanceMode(maintenance);
                
                // If maintenance mode is off, everyone is authorized
                // If maintenance mode is on, only super admins are authorized
                setIsAuthorized(!maintenance || isSuperAdmin);
            }
        } catch (error) {
            console.error("Error checking maintenance mode:", error);
            setMaintenanceMode(false);
            setIsAuthorized(true); // Default to authorized if we can't check maintenance mode
        }
    };

    // Fetch user data from Firestore
    const fetchUserData = async (uid) => {
        try {
            const userDocRef = doc(db, "users", uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
                const data = userDoc.data();
                setUserData(data);
                
                // Check admin and super admin status
                const adminStatus = await checkIsAdmin(uid);
                const superAdminStatus = data.isSuperAdmin || false;
                
                setIsAdmin(adminStatus);
                setIsSuperAdmin(superAdminStatus);
                
                // Check if user should be authorized based on maintenance mode
                await checkMaintenanceMode();
            } else {
                console.error("No user data found in Firestore");
                setUserData({});
                setIsAdmin(false);
                setIsSuperAdmin(false);
                setIsAuthorized(false);
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
            setUserData({});
            setIsAdmin(false);
            setIsSuperAdmin(false);
            setIsAuthorized(false);
        }
    };

    // Listen for auth state changes (user login/logout)
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setLoading(true);
            if (user) {
                setCurrentUser(user);
                await fetchUserData(user.uid);
            } else {
                setCurrentUser(null);
                setUserData(null);
                setIsAdmin(false);
                setIsSuperAdmin(false);
                await checkMaintenanceMode(); // Still check maintenance mode for non-authenticated users
            }
            setLoading(false);
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
            setIsAdmin(false);
            setIsSuperAdmin(false);
        } catch (error) {
            handleAuthError(error, "Sign-out");
        }
    };

    const value = {
        currentUser,
        userData, // Providing user data (photoURL, bio, etc.) to components
        authError,
        isAdmin,
        isSuperAdmin,
        maintenanceMode,
        isAuthorized,
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
