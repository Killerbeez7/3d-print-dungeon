import { User } from "firebase/auth";
import { UserData } from "./auth";

export interface AuthContextType {
    currentUser: User | null;
    userData: UserData | null;
    roles: string[];
    isAdmin: boolean;
    authError: string;
    maintenanceMode: boolean;
    maintenanceMessage: string | null;
    maintenanceEndTime: Date | null;
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
