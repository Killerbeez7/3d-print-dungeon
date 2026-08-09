import { useEffect, useRef, useState, useCallback, useMemo } from "react";
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

// types
import type {
    PrivateProfile,
    PublicProfile,
    Role,
    Permission,
} from "@/features/user/types/user";
import type { CustomClaims, AuthUser } from "@/features/auth/types/auth";
import { AuthErrorType, handleAuthError } from "@/features/auth/utils/errorHandling";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [authUser, setAuthUser] = useState<AuthUser | null>(null);
    const [privateProfile, setPrivateProfile] = useState<PrivateProfile | null>(null);
    const [publicProfile, setPublicProfile] = useState<PublicProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState<string | null>(null);
    const [claims, setClaims] = useState<CustomClaims | null>(null);
    const oauthPopupPendingRef = useRef(false);

    const handleAuthErrorWrapper = useCallback(
        (error: unknown, provider: string): never => {
            const authError = handleAuthError(error, provider);
            setAuthError(
                authError.type === AuthErrorType.CANCELLED ? null : authError.message,
            );
            setLoading(false);
            throw authError;
        },
        [],
    );

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
        if (oauthPopupPendingRef.current) return;

        oauthPopupPendingRef.current = true;
        setLoading(true);
        setAuthError(null);
        try {
            await signInWithGoogle();
            setLoading(false);
        } catch (error) {
            handleAuthErrorWrapper(error, "Google Sign-in");
        } finally {
            oauthPopupPendingRef.current = false;
        }
    };

    useEffect(() => {
        const clearOAuthLoadingOnFocus = () => {
            if (!oauthPopupPendingRef.current) return;

            window.setTimeout(() => {
                if (oauthPopupPendingRef.current) {
                    oauthPopupPendingRef.current = false;
                    setAuthError(null);
                    setLoading(false);
                }
            }, 300);
        };

        window.addEventListener("focus", clearOAuthLoadingOnFocus);
        return () => window.removeEventListener("focus", clearOAuthLoadingOnFocus);
    }, []);

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
        let unsubscribePublicProfile: (() => void) | undefined;
        let unsubscribePrivateProfile: (() => void) | undefined;

        const clearProfileSubscriptions = () => {
            unsubscribePublicProfile?.();
            unsubscribePrivateProfile?.();

            unsubscribePublicProfile = undefined;
            unsubscribePrivateProfile = undefined;
        };

        const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
            clearProfileSubscriptions();

            if (!user) {
                setCurrentUser(null);
                setPublicProfile(null);
                setPrivateProfile(null);
                setClaims(null);
                setLoading(false);
                return;
            }

            setCurrentUser(user);

            try {
                const nextClaims = await refreshIdToken();

                setClaims(nextClaims as CustomClaims);

                unsubscribePublicProfile = fetchPublicProfile(user.uid, (profile) => {
                    setPublicProfile(profile);
                });

                unsubscribePrivateProfile = fetchPrivateProfile(user.uid, (profile) => {
                    setPrivateProfile(profile);
                    setLoading(false);
                });
            } catch (error) {
                console.error("Failed to initialize authenticated user:", error);

                clearProfileSubscriptions();

                setCurrentUser(null);
                setPublicProfile(null);
                setPrivateProfile(null);
                setClaims(null);
                setLoading(false);
            }
        });

        return () => {
            clearProfileSubscriptions();
            unsubscribeAuth();
        };
    }, []);

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
            new Set<Role>([...claimRolesLocal, ...(privateProfile.roles || [])]),
        );

        const computed: AuthUser = {
            uid: currentUser.uid,
            email: privateProfile.email,
            displayName:
                publicProfile.displayName || currentUser.displayName || "Anonymous",
            username: publicProfile.username,
            photoURL: publicProfile.photoURL ?? currentUser.photoURL ?? null,
            roles: combinedRoles,
            permissions: privateProfile?.permissions || [],
            provider:
                privateProfile?.authProvider ||
                (currentUser.providerData[0]?.providerId ?? "password"),
            isAdmin:
                combinedRoles.includes("admin") || combinedRoles.includes("superadmin"),
            isSuper: combinedRoles.includes("superadmin"),
            isArtist:
                combinedRoles.includes("artist") || publicProfile?.isArtist === true,
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
