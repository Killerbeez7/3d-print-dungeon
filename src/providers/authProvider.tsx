import { useEffect, useState, useCallback } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../config/firebase";
import { isAdmin } from "../services/adminService";
import { AuthContext } from "../contexts/authContext";
import { UserData } from "../types/auth";
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
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState("");
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [maintenanceMessage, setMaintenanceMessage] = useState<string | null>(null);
    const [maintenanceEndTime, setMaintenanceEndTime] = useState<Date | null>(null);
    const [isAdminUser, setIsAdminUser] = useState(false);

    const handleAuthError = (error: unknown, provider: string) => {
        const errorMessage =
            error instanceof Error ? error.message : `Unknown error with ${provider}`;
        console.error(`${provider} error:`, error);
        setAuthError(errorMessage);
        throw error;
    };

    const changePassword = async (currentPassword: string, newPassword: string) => {
        if (!currentUser) throw new Error("No user is currently signed in");
        try {
            await changeUserPassword(currentUser, currentPassword, newPassword);
        } catch (error) {
            handleAuthError(error, "password change");
        }
    };

    const handleGithubSignIn = async () => {
        try {
            // Implement GitHub sign-in logic here
            throw new Error("GitHub sign-in not implemented");
        } catch (error) {
            handleAuthError(error, "GitHub sign-in");
        }
    };

    const fetchUserData = useCallback(async (): Promise<void> => {
        if (!currentUser) {
            setUserData(null);
            setIsAdminUser(false);
            return;
        }

        getUserFromDatabase(currentUser.uid, async (data: UserData | null) => {
            if (data) {
                setUserData(data);
                setIsAdminUser(await isAdmin(currentUser.uid));
            } else {
                setUserData(null);
                setIsAdminUser(false);
            }
        });
    }, [currentUser]);

    const handleEmailSignUp = async (email: string, password: string) => {
        try {
            const user = await signUpWithEmail(email, password);
            setCurrentUser(user);
            await fetchUserData();
        } catch (error) {
            handleAuthError(error, "Email Sign-up");
        }
    };

    const handleEmailSignIn = async (email: string, password: string) => {
        try {
            const user = await signInWithEmail(email, password);
            setCurrentUser(user);
            await fetchUserData();
        } catch (error) {
            handleAuthError(error, "Email Sign-in");
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            const user = await signInWithGoogle();
            setCurrentUser(user);
            await fetchUserData();
        } catch (error) {
            handleAuthError(error, "Google Sign-in");
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut();
            setCurrentUser(null);
            setUserData(null);
            setIsAdminUser(false);
        } catch (error) {
            handleAuthError(error, "Sign-out");
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setCurrentUser(user);
                await fetchUserData();
            } else {
                setCurrentUser(null);
                setUserData(null);
                setIsAdminUser(false);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [fetchUserData]);

    useEffect(() => {
        const checkMaintenance = async () => {
            const userId: UserId = currentUser?.uid ? undefined : null;
            const status = await checkMaintenanceStatus(userId);
            setMaintenanceMode(status.inMaintenance);
            setMaintenanceMessage(status.message);
            setMaintenanceEndTime(status.endTime);
            setIsAdminUser(status.isAdmin);
        };

        checkMaintenance();
        const unsubscribe = subscribeToMaintenanceStatus(
            (status: MaintenanceStatus) => {
                setMaintenanceMode(status.inMaintenance);
                setMaintenanceMessage(status.message);
                setMaintenanceEndTime(status.endTime);
                setIsAdminUser(status.isAdmin);
            },
            currentUser?.uid ? undefined : null
        );

        return () => unsubscribe();
    }, [currentUser?.uid]);

    const value = {
        currentUser,
        userData,
        authError,
        maintenanceMode,
        maintenanceMessage,
        maintenanceEndTime,
        isAdmin: isAdminUser,
        loading,
        handleEmailSignUp,
        handleEmailSignIn,
        handleGoogleSignIn,
        handleGithubSignIn,
        handleSignOut,
        changePassword,
        fetchUserData,
        handleAuthError,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
