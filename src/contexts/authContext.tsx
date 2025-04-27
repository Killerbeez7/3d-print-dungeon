import { User } from "firebase/auth";
import { createContext } from "react";
import { UserData } from "../types/auth";

// Types for AuthContext
interface AuthContextType {
    currentUser: User | null;
    userData: UserData | null;
    authError: string;
    maintenanceMode: boolean;
    maintenanceMessage: string | null;
    maintenanceEndTime: Date | null;
    isAdmin: boolean;
    loading: boolean;
    handleEmailSignUp: (email: string, password: string) => Promise<void>;
    handleEmailSignIn: (email: string, password: string) => Promise<void>;
    handleGoogleSignIn: () => Promise<void>;
    handleGithubSignIn: () => Promise<void>;
    handleSignOut: () => Promise<void>;
    changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
    fetchUserData: () => Promise<void>;
    handleAuthError: (error: unknown, provider: string) => never;
}

export const AuthContext = createContext<AuthContextType>({
    currentUser: null,
    userData: null,
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
