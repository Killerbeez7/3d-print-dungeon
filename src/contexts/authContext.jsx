import { createContext, useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebase";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { isAdmin } from "../services/adminService";

// Auth service functions
import {
    signOutUser,
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    signInWithTwitter,
    signInWithFacebook,
    getUserFromDatabase
} from "../services/authService";

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

const db = getFirestore();

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState("");
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [isAdminUser, setIsAdminUser] = useState(false);

    // Check maintenance mode
    const checkMaintenanceMode = async () => {
        try {
            const settingsRef = doc(db, "settings", "global");
            const settingsDoc = await getDoc(settingsRef);
            if (settingsDoc.exists()) {
                const maintenance = settingsDoc.data().siteMaintenanceMode || false;
                setMaintenanceMode(maintenance);
            }
        } catch (error) {
            console.error("Error checking maintenance mode:", error);
            setMaintenanceMode(false);
        }
    };

    // Check if user is admin using adminService
    const checkAdminStatus = async (uid) => {
        try {
            const adminStatus = await isAdmin(uid);
            setIsAdminUser(adminStatus);
            return adminStatus;
        } catch (error) {
            console.error("Error checking admin status:", error);
            setIsAdminUser(false);
            return false;
        }
    };

    // Fetch user data from Firestore
    const fetchUserData = async (uid) => {
        try {
            const unsubscribe = getUserFromDatabase(uid, (data) => {
                if (data) {
                    setUserData(data);
                    checkAdminStatus(uid);
                } else {
                    setUserData({});
                    setIsAdminUser(false);
                }
            });
            return unsubscribe;
        } catch (error) {
            console.error("Error fetching user data:", error);
            setUserData({});
            setIsAdminUser(false);
        }
    };

    // Listen for auth state changes
    useEffect(() => {
        let userDataUnsubscribe;
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setLoading(true);
            if (user) {
                setCurrentUser(user);
                userDataUnsubscribe = await fetchUserData(user.uid);
            } else {
                setCurrentUser(null);
                setUserData(null);
                setIsAdminUser(false);
            }
            await checkMaintenanceMode();
            setLoading(false);
        });
        return () => {
            unsubscribe();
            if (userDataUnsubscribe) {
                userDataUnsubscribe();
            }
        };
    }, []);

    // Common error handling for auth methods
    const handleAuthError = (error, provider) => {
        console.error(`${provider} error:`, error);
        setAuthError(error.message || `Failed with ${provider}.`);
        throw error;
    };

    // Auth methods with error handling
    const handleEmailSignUp = async (email, password) => {
        try {
            setAuthError("");
            const user = await signUpWithEmail(email, password);
            setCurrentUser(user);
            await fetchUserData(user.uid);
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
            setUserData(null);
            setIsAdminUser(false);
        } catch (error) {
            handleAuthError(error, "Sign-out");
        }
    };

    const value = {
        currentUser,
        userData,
        authError,
        maintenanceMode,
        isAdmin: isAdminUser,
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

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
