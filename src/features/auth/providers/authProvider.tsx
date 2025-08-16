import { useEffect, useState, useCallback, useMemo } from "react";
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
    resetPassword,
    fetchPublicProfile,
    fetchPrivateProfile,
} from "@/features/auth/services/authService";
import {
    checkMaintenanceStatus,
    subscribeToMaintenanceStatus,
} from "@/features/maintenance/services/maintenanceService";
// types
import type { MaintenanceStatus, UserId } from "@/features/maintenance/types/maintenance";
import type { PrivateProfile, PublicProfile, Role, Permission } from "@/features/user/types/user";
import type { CustomClaims, AuthUser } from "@/features/auth/types/auth";
import { handleAuthError } from "@/features/auth/utils/errorHandling";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [authUser, setAuthUser] = useState<AuthUser | null>(null);
    const [privateProfile, setPrivateProfile] = useState<PrivateProfile | null>(null);
    const [publicProfile, setPublicProfile] = useState<PublicProfile | null>(null);
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
            setPrivateProfile(null);
            setPublicProfile(null);
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

                    // Fetch both public and private profiles
                    const publicUnsubscribe = fetchPublicProfile(user.uid, (publicData: PublicProfile | null) => {
                        if (publicData) {
                            setPublicProfile(publicData);
                        } else {
                            // Create basic public profile if none exists (fallback)
                            const basicPublicProfile: PublicProfile = {
                                username: user.displayName?.toLowerCase().replace(/\s+/g, '') || `user${user.uid.slice(0, 8)}`,
                                displayName: user.displayName || "Anonymous",
                                photoURL: user.photoURL || undefined,
                                bio: "",
                                location: "",
                                website: "",
                                socialLinks: {},
                                stats: {
                                    followersCount: 0,
                                    followingCount: 0,
                                    postsCount: 0,
                                    likesCount: 0,
                                    viewsCount: 0,
                                    uploadsCount: 0,
                                },
                                isArtist: false,
                                isVerified: false,
                                isPremium: false,
                                artistCategories: [],
                                featuredWorks: [],
                                joinedAt: new Date(),
                                lastActiveAt: new Date(),
                            };
                            setPublicProfile(basicPublicProfile);
                        }
                    });
                    
                    const privateUnsubscribe = fetchPrivateProfile(user.uid, (privateData: PrivateProfile | null) => {
                        if (privateData) {
                            setPrivateProfile(privateData);
                        } else {
                            // Create basic private profile if none exists
                            const basicPrivateProfile: PrivateProfile = {
                                uid: user.uid,
                                email: user.email,
                                authProvider: user.providerData[0]?.providerId || "password",
                                emailVerified: user.emailVerified,
                                roles: ["user"], // Default role
                                permissions: [], // Default empty permissions
                                profileComplete: false, // Will need to be determined based on profile completion
                                accountStatus: "active",
                                createdAt: new Date(),
                                updatedAt: new Date(),
                                lastLoginAt: new Date(),
                                loginCount: 1,
                            };
                            setPrivateProfile(basicPrivateProfile);
                        }
                        setLoading(false);
                    });
                    
                    // Clean up subscriptions when component unmounts
                    return () => {
                        publicUnsubscribe();
                        privateUnsubscribe();
                    };
                } catch (error) {
                    console.error("Failed to fetch user data on auth change", error);
                    // Don't call signOut here as it creates a loop
                    setCurrentUser(null);
                    setPrivateProfile(null);
                    setPublicProfile(null);
                    setClaims(null);
                    setLoading(false);
                }
            } else {
                setCurrentUser(null);
                setPrivateProfile(null);
                setPublicProfile(null);
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

    // Extract roles from claims and private profile
    const claimRoles: Role[] = (() => {
        if (!claims) return [];
        const valid: Array<keyof CustomClaims> = [
            "super",
            "admin",
            "moderator",
            "contributor",
            "premium",
        ];
        const roles: Role[] = [];
        for (const key of valid) {
            if (claims[key] === true) {
                // Map known claim keys to Role union
                if (key === "super") roles.push("superadmin");
                else if (key === "admin") roles.push("admin");
                else if (key === "moderator") roles.push("moderator");
                // contributor/premium are not Roles; ignore for role checks
            }
        }
        return roles;
    })();
    
    const allRoles: Role[] = useMemo(() => {
        const pr: Role[] = privateProfile?.roles || [];
        return Array.from(new Set<Role>([...claimRoles, ...pr]));
    }, [claimRoles, privateProfile?.roles]);
    
    const permissions: Permission[] = privateProfile?.permissions || [];
    
    const isAdmin = allRoles.includes("admin") || allRoles.includes("superadmin");
    const isSuper = allRoles.includes("superadmin");
    const isArtist = allRoles.includes("artist") || publicProfile?.isArtist === true;
    const isModerator = allRoles.includes("moderator");

    const handleFacebookSignIn = async () => {
        throw new Error("Facebook sign-in not implemented");
    };
    const handleTwitterSignIn = async () => {
        throw new Error("Twitter sign-in not implemented");
    };

    const handlePasswordReset = async (email: string) => {
        setLoading(true);
        try {
            await resetPassword(email);
            setLoading(false);
        } catch (error) {
            handleAuthErrorWrapper(error, "Password Reset");
        }
    };

    // Derive consolidated auth user once inputs are ready
    useEffect(() => {
        if (!currentUser || !publicProfile || !privateProfile) {
            setAuthUser(null);
            return;
        }
        // Build roles from claims + private profile
        const claimRolesLocal: Role[] = (() => {
            if (!claims) return [];
            const roles: Role[] = [];
            if (claims.super === true) roles.push("superadmin");
            if (claims.admin === true) roles.push("admin");
            if (claims.moderator === true) roles.push("moderator");
            return roles;
        })();

        const combinedRoles: Role[] = Array.from(
            new Set<Role>([...claimRolesLocal, ...(privateProfile.roles || [])])
        );

        const computed: AuthUser = {
            uid: currentUser.uid,
            email: privateProfile.email,
            displayName: publicProfile.displayName || currentUser.displayName || "Anonymous",
            username: publicProfile.username,
            photoURL: publicProfile.photoURL ?? currentUser.photoURL ?? null,
            roles: combinedRoles,
            permissions: privateProfile?.permissions || [],
            provider: privateProfile?.authProvider || (currentUser.providerData[0]?.providerId ?? "password"),
            isAdmin: combinedRoles.includes("admin") || combinedRoles.includes("superadmin"),
            isSuper: combinedRoles.includes("superadmin"),
            isArtist: combinedRoles.includes("artist") || publicProfile?.isArtist === true,
            isModerator: combinedRoles.includes("moderator"),
        };
        setAuthUser(computed);
    }, [currentUser, publicProfile, privateProfile, claims]);

    const value = {
        authUser,
        currentUser,
        privateProfile,
        publicProfile,
        roles: allRoles,
        permissions,
        isAdmin,
        isSuper,
        isArtist,
        isModerator,
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
        handlePasswordReset,
        handleAuthError: handleAuthErrorWrapper,
        fetchUserData: () => Promise.resolve(), // placeholder if needed
        handleFacebookSignIn,
        handleTwitterSignIn,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
