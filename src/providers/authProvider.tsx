import { useEffect, useState, useCallback } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../config/firebase";
import { AuthContext } from "../contexts/authContext";
import { RawUserData, CustomClaims } from "../types/auth";
import { refreshIdToken } from "../utils/auth/refreshIdToken";
import { MaintenanceStatus, UserId } from "../types/maintenance";
import {
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    signOutUser as signOut,
    changePassword as changeUserPassword,
    getUserFromDatabase,
} from "../services/authService";
import {
    checkMaintenanceStatus,
    subscribeToMaintenanceStatus,
} from "../services/maintenanceService";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<RawUserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState<string | null>(null);
    const [claims, setClaims] = useState<CustomClaims | null>(null);
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [maintenanceMessage, setMaintenanceMessage] = useState<string | null>(null);
    const [maintenanceEndTime, setMaintenanceEndTime] = useState<Date | null>(null);

    const handleAuthError = useCallback((error: unknown, provider: string) => {
        const errorMessage =
            error instanceof Error ? error.message : `Unknown error with ${provider}`;
        console.error(`${provider} error:`, error);
        setAuthError(errorMessage);
        setLoading(false);
        throw error;
    }, []);

    const changePassword = async (currentPassword: string, newPassword: string) => {
        if (!currentUser) throw new Error("No user is currently signed in");
        try {
            await changeUserPassword(currentUser, currentPassword, newPassword);
        } catch (error) {
            handleAuthError(error, "Password Change");
        }
    };

    const handleEmailSignUp = async (email: string, password: string) => {
        // setLoading(true);
        try {
            await signUpWithEmail(email, password);
        } catch (error) {
            handleAuthError(error, "Email Sign-up");
        }
    };

    const handleEmailSignIn = async (email: string, password: string) => {
        // setLoading(true);
        try {
            await signInWithEmail(email, password);
        } catch (error) {
            handleAuthError(error, "Email Sign-in");
        }
    };

    const handleGoogleSignIn = async () => {
        // setLoading(true);
        try {
            await signInWithGoogle();
        } catch (error) {
            handleAuthError(error, "Google Sign-in");
        }
    };

    const handleSignOut = async () => {
        // setLoading(true);
        try {
            await signOut();
        } catch (error) {
            handleAuthError(error, "Sign-out");
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
                    await signOut();
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
        handleAuthError,
        fetchUserData: () => Promise.resolve(), // placeholder if needed
    };

    if (loading) return <div>Loading authentication...</div>;

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
