import { useEffect, useState, useCallback } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/config/firebaseConfig";
// services, context, utils
import { refreshIdToken } from "@/features/auth/utils/refreshIdToken";
import { AuthContext } from "@/features/auth/context/authContext";
import {
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    signOutUser as signOut,
    changePassword as changeUserPassword,
    getUserFromDatabase,
} from "@/features/auth/services/authService";
import {
    checkMaintenanceStatus,
    subscribeToMaintenanceStatus,
} from "@/features/maintenance/services/maintenanceService";
// types
import type { MaintenanceStatus, UserId } from "@/features/maintenance/types/maintenance";
import type { RawUserData } from "@/features/user/types/user";
import type { CustomClaims } from "@/features/auth/types/auth";
import { handleAuthError } from "@/features/auth/utils/errorHandling";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<RawUserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState<string | null>(null);
    const [claims, setClaims] = useState<CustomClaims | null>(null);
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [maintenanceMessage, setMaintenanceMessage] = useState<string | null>(null);
    const [maintenanceEndTime, setMaintenanceEndTime] = useState<Date | null>(null);

    const handleAuthErrorWrapper = useCallback((error: unknown, provider: string): never => {
        const authError = handleAuthError(error, provider);
        setAuthError(authError.message);
        setLoading(false);
        throw authError;
    }, []);

    const changePassword = async (currentPassword: string, newPassword: string) => {
        setLoading(true);
        if (!currentUser) throw new Error("No user is currently signed in");
        try {
            await changeUserPassword(currentUser, currentPassword, newPassword);
        } catch (error) {
            handleAuthErrorWrapper(error, "Password Change");
        }
    };

    const handleEmailSignUp = async (email: string, password: string) => {
        setLoading(true);
        try {
            await signUpWithEmail(email, password);
            setLoading(false);
        } catch (error) {
            handleAuthErrorWrapper(error, "Email Sign-up");
        }
    };

    const handleEmailSignIn = async (email: string, password: string) => {
        setLoading(true);
        try {
            await signInWithEmail(email, password);
            setLoading(false);
        } catch (error) {
            handleAuthErrorWrapper(error, "Email Sign-in");
        }
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        try {
            await signInWithGoogle();
            setLoading(false);
        } catch (error) {
            handleAuthErrorWrapper(error, "Google Sign-in");
        }
    };

    const handleSignOut = async () => {
        setLoading(true);
        try {
            // Clear user data before signing out to avoid permission errors
            setCurrentUser(null);
            setUserData(null);
            setClaims(null);
            await signOut();
        } catch (error) {
            handleAuthErrorWrapper(error, "Sign-out");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setCurrentUser(user);
                try {
                    const claims = await refreshIdToken();
                    setClaims(claims as CustomClaims);

                    getUserFromDatabase(user.uid, (data: RawUserData | null) => {
                        setUserData({
                            ...(data || {}),
                            roles: data?.roles || [],
                        } as RawUserData);
                        setLoading(false);
                    });
                } catch (error) {
                    console.error("Failed to fetch user data on auth change", error);
                    // Don't call signOut here as it creates a loop
                    setCurrentUser(null);
                    setUserData(null);
                    setClaims(null);
                    setLoading(false);
                }
            } else {
                setCurrentUser(null);
                setUserData(null);
                setClaims(null);
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const checkMaintenance = async () => {
            const userId: UserId = currentUser?.uid ? undefined : null;
            const status = await checkMaintenanceStatus(userId);
            setMaintenanceMode(status.inMaintenance);
            setMaintenanceMessage(status.message);
            setMaintenanceEndTime(status.endTime);
        };

        checkMaintenance();

        const unsubscribe = subscribeToMaintenanceStatus(
            (status: MaintenanceStatus) => {
                setMaintenanceMode(status.inMaintenance);
                setMaintenanceMessage(status.message);
                setMaintenanceEndTime(status.endTime);
            },
            currentUser?.uid ? undefined : null
        );

        return () => unsubscribe();
    }, [currentUser?.uid]);

    const claimRoles = claims
        ? Object.entries(claims)
              .filter(
                  ([k, v]) =>
                      v === true &&
                      ["super", "admin", "moderator", "contributor", "premium"].includes(
                          k
                      )
              )
              .map(([k]) => k)
        : [];

    const handleFacebookSignIn = async () => {
        throw new Error("Facebook sign-in not implemented");
    };
    const handleTwitterSignIn = async () => {
        throw new Error("Twitter sign-in not implemented");
    };

    const value = {
        currentUser,
        userData,
        roles: claimRoles,
        isAdmin: claims?.admin === true,
        isSuper: claims?.super === true,
        claims,
        authError,
        maintenanceMode,
        maintenanceMessage,
        maintenanceEndTime,
        loading,
        handleEmailSignUp,
        handleEmailSignIn,
        handleGoogleSignIn,
        handleSignOut,
        changePassword,
        handleAuthError: handleAuthErrorWrapper,
        fetchUserData: () => Promise.resolve(), // placeholder if needed
        handleFacebookSignIn,
        handleTwitterSignIn,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
