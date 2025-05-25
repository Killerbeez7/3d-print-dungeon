import { createContext } from "react";
import { AuthContextType } from "../types/authContext";

export const AuthContext = createContext<AuthContextType>({
    currentUser: null,
    userData: null,
    roles: [],
    authError: "",
    maintenanceMode: false,
    maintenanceMessage: null,
    maintenanceEndTime: null,
    isAdmin: false,
    loading: false,
    handleEmailSignUp: async () => {},
    handleEmailSignIn: async () => {},
    handleGoogleSignIn: async () => {},
    handleGithubSignIn: async () => {},
    handleSignOut: async () => {},
    changePassword: async () => {},
    fetchUserData: async () => {},
    handleAuthError: () => {
        throw new Error("Not implemented");
    },
});
