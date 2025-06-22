import type { User as FirebaseUser } from "firebase/auth";
import type { Timestamp } from "firebase/firestore";

export interface RawUserData {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    roles?: string[];
    username?: string;
    createdAt?: Timestamp | Date;
    lastLogin?: Timestamp | Date;
}

export interface AuthContextValue {
    currentUser: FirebaseUser | null;
    userData: RawUserData | null;
    roles: string[];
    isAdmin: boolean;
    isSuper: boolean;
    claims: CustomClaims | null;
    maintenanceMode: boolean;
    maintenanceMessage: string | null;
    maintenanceEndTime: Date | null;
    loading: boolean;
    authError: string | null;
    handleEmailSignUp(email: string, password: string): Promise<void>;
    handleEmailSignIn(email: string, password: string): Promise<void>;
    handleGoogleSignIn(): Promise<void>;
    handleSignOut(): Promise<void>;
    changePassword(currentPassword: string, newPassword: string): Promise<void>;
    fetchUserData(): Promise<void>;
    handleAuthError(error: unknown, provider: string): never;
}


export type CustomClaims = {
    [key: string]: unknown;
    super?: boolean;
    admin?: boolean;
    moderator?: boolean;
    contributor?: boolean;
    premium?: boolean;
    // Add other roles if needed
};
