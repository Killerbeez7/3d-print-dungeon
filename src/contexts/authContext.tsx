import { createContext } from "react";
import { AuthContextValue } from "../types/auth";

export const AuthContext = createContext<AuthContextValue>({
    currentUser: null,
    userData: null,
    roles: [],
    isAdmin: false,
    isSuper: false,
    claims: null,
    authError: null,
    maintenanceMode: false,
    maintenanceMessage: null,
    maintenanceEndTime: null,
    loading: false,
    handleEmailSignUp: async () => {},
    handleEmailSignIn: async () => {},
    handleGoogleSignIn: async () => {},
    handleSignOut: async () => {},
    changePassword: async () => {},
    fetchUserData: async () => {},
    handleAuthError: () => {
        throw new Error("Not implemented");
    },
});
