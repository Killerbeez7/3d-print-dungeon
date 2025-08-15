import { createContext } from "react";
import { AuthContextValue } from "../types/auth";

export const AuthContext = createContext<AuthContextValue>({
    authUser: null,
    currentUser: null,
    privateProfile: null,
    publicProfile: null,
    roles: [],
    permissions: [],
    isAdmin: false,
    isSuper: false,
    isArtist: false,
    isModerator: false,
    claims: null,
    authError: null,
    maintenanceMode: false,
    maintenanceMessage: null,
    maintenanceEndTime: null,
    loading: false,
    handleEmailSignUp: async () => {},
    handleEmailSignIn: async () => {},
    handleGoogleSignIn: async () => {},
    handleFacebookSignIn: async () => {},
    handleTwitterSignIn: async () => {},
    handleSignOut: async () => {},
    changePassword: async () => {},
    fetchUserData: async () => {},
    handleAuthError: () => {
        throw new Error("Not implemented");
    },
});
