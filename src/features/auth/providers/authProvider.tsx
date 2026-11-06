import { useState, useEffect, useRef, useCallback, useMemo, type ReactNode } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/config/firebaseConfig";
// services, context, utils
import { refreshIdToken } from "../utils/refreshIdToken";
import { clearSessionHint, writeSessionHint } from "../utils/sessionHint";
import { AuthContext } from "../context/authContext";
import {
  signUpWithEmail,
  signInWithEmail,
  signInWithGoogle,
  signOutUser as signOut,
  changePassword as changeUserPassword,
  resetPassword,
  fetchPublicProfile,
  fetchPrivateProfile,
  syncProfilePhoto,
} from "../services/authService";
import { googlePhotoURL, photoToSync } from "../utils/providerPhoto";

// types
import type { PrivateProfile } from "@/features/user/types/user";
import type { PublicProfile } from "@/features/user/profile";
import type { Role, Permission } from "../types/permissions";
import type { CustomClaims, AuthUser } from "../types/auth";

import { AuthErrorType, handleAuthError } from "../utils/errorHandling";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  //   const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [privateProfile, setPrivateProfile] = useState<PrivateProfile | null>(null);
  const [publicProfile, setPublicProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  // Session and claims known; profiles may still be loading.
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [claims, setClaims] = useState<CustomClaims | null>(null);
  const oauthPopupPendingRef = useRef(false);

  const handleAuthErrorWrapper = useCallback(
    (error: unknown, provider: string): never => {
      const authError = handleAuthError(error, provider);
      setAuthError(authError.type === AuthErrorType.CANCELLED ? null : authError.message);
      setLoading(false);
      throw authError;
    },
    []
  );

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!currentUser) {
      throw new Error("No user is currently signed in");
    }

    setLoading(true);
    setAuthError(null);

    try {
      await changeUserPassword(currentUser, currentPassword, newPassword);
    } catch (error) {
      handleAuthErrorWrapper(error, "Password Change");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignUp = async (email: string, password: string) => {
    setLoading(true);
    setAuthError(null);

    try {
      await signUpWithEmail(email, password);
    } catch (error) {
      handleAuthErrorWrapper(error, "Email Sign-up");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignIn = async (email: string, password: string) => {
    setLoading(true);
    setAuthError(null);

    try {
      await signInWithEmail(email, password);
    } catch (error) {
      handleAuthErrorWrapper(error, "Email Sign-in");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (oauthPopupPendingRef.current) {
      return;
    }

    oauthPopupPendingRef.current = true;
    setLoading(true);
    setAuthError(null);

    try {
      await signInWithGoogle();
    } catch (error) {
      handleAuthErrorWrapper(error, "Google Sign-in");
    } finally {
      oauthPopupPendingRef.current = false;
      setLoading(false);
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
        clearSessionHint();
        setCurrentUser(null);
        setPublicProfile(null);
        setPrivateProfile(null);
        setClaims(null);
        setAuthReady(true);
        setLoading(false);
        return;
      }

      setCurrentUser(user);

      try {
        // The token on this device is enough to start; a fresh one follows in
        // the background so role changes still arrive without signing out.
        const nextClaims = await refreshIdToken(false);

        setClaims(nextClaims as CustomClaims);
        setAuthReady(true);

        refreshIdToken(true)
          .then((freshClaims) => {
            if (auth.currentUser?.uid === user.uid) setClaims(freshClaims as CustomClaims);
          })
          .catch(() => {
            // Offline or signed out meanwhile: keep the claims we have.
          });

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
        setAuthReady(true);
        setLoading(false);
      }
    });

    return () => {
      clearProfileSubscriptions();
      unsubscribeAuth();
    };
  }, []);

  const claimRoles = useMemo<Role[]>(() => {
    if (!claims) {
      return [];
    }

    const roles: Role[] = [];

    if (claims.super === true) {
      roles.push("superadmin");
    }

    if (claims.admin === true) {
      roles.push("admin");
    }

    if (claims.moderator === true) {
      roles.push("moderator");
    }

    if (claims.tester === true) {
      roles.push("tester");
    }

    return roles;
  }, [claims]);

  const allRoles = useMemo<Role[]>(() => {
    const profileRole = privateProfile?.roles ?? [];

    return Array.from(new Set<Role>([...claimRoles, ...profileRole]));
  }, [claimRoles, privateProfile?.roles]);

  const permissions = useMemo<Permission[]>(
    () => privateProfile?.permissions ?? [],
    [privateProfile?.permissions]
  );

  const isAdmin = allRoles.includes("admin") || allRoles.includes("superadmin");
  const isSuper = allRoles.includes("superadmin");
  const isArtist = allRoles.includes("artist") || publicProfile?.isArtist === true;
  const isModerator = allRoles.includes("moderator");

  const authUser = useMemo<AuthUser | null>(() => {
    if (!currentUser || !publicProfile || !privateProfile) {
      return null;
    }

    return {
      uid: currentUser.uid,
      email: privateProfile.email,
      displayName: publicProfile.displayName || currentUser.displayName || "Anonymous",
      username: publicProfile.username,
      photoURL: publicProfile.photoURL || googlePhotoURL(currentUser) || currentUser.photoURL || null,

      roles: allRoles,
      permissions,

      provider:
        privateProfile.authProvider ||
        currentUser.providerData[0]?.providerId ||
        "password",

      isAdmin,
      isSuper,
      isArtist,
      isModerator,
    };
  }, [
    currentUser,
    publicProfile,
    privateProfile,
    allRoles,
    permissions,
    isAdmin,
    isSuper,
    isArtist,
    isModerator,
  ]);

  // Keep a Google-sourced profile photo current: Firebase refreshes the Google copy on each
  // Google sign-in, but the saved one stays at the first sign-in's (and can stop loading).
  const savedPhotoURL = publicProfile?.photoURL;
  useEffect(() => {
    if (!currentUser || publicProfile === null) return;
    const next = photoToSync(savedPhotoURL, googlePhotoURL(currentUser));
    if (!next) return;
    syncProfilePhoto(currentUser, next).catch(() => {
      // Not critical: the header already falls back to the Google photo.
    });
  }, [currentUser, publicProfile, savedPhotoURL]);

  // Remember who is signed in on this browser for the header on next reload.
  useEffect(() => {
    if (authUser) {
      writeSessionHint({
        displayName: authUser.displayName,
        username: authUser.username ?? null,
        photoURL: authUser.photoURL ?? null,
      });
    }
  }, [authUser]);

  const handlePasswordReset = async (email: string) => {
    setLoading(true);
    try {
      await resetPassword(email);
      setLoading(false);
    } catch (error) {
      handleAuthErrorWrapper(error, "Password Reset");
    }
  };

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
    authReady,
    handleEmailSignUp,
    handleEmailSignIn,
    handleGoogleSignIn,
    handleSignOut,
    changePassword,
    handlePasswordReset,
    handleAuthError: handleAuthErrorWrapper,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
