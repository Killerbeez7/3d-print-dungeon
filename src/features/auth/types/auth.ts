import type { RawUserData, CurrentUser } from "@/features/user/types/user";

export type CustomClaims = {
    [key: string]: unknown;
    super?: boolean;
    admin?: boolean;
    moderator?: boolean;
    contributor?: boolean;
    premium?: boolean;
    // Add other roles if needed
};

export interface AuthContextValue {
    currentUser: CurrentUser | null;
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
    handleFacebookSignIn(): Promise<void>;
    handleTwitterSignIn(): Promise<void>;
    handleSignOut(): Promise<void>;
    changePassword(currentPassword: string, newPassword: string): Promise<void>;
    fetchUserData(): Promise<void>;
    handleAuthError(error: unknown, provider: string): never;
}
