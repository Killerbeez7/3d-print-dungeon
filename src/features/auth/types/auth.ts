import type { CurrentUser, PrivateProfile, PublicProfile, Role, Permission } from "@/features/user/types/user";

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
    authUser: AuthUser | null;
    currentUser: CurrentUser | null;
    privateProfile: PrivateProfile | null;
    publicProfile: PublicProfile | null;
    roles: Role[];
    permissions: Permission[];
    isAdmin: boolean;
    isSuper: boolean;
    isArtist: boolean;
    isModerator: boolean;
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

export interface UsernameReservationResponse {
    available: boolean;
    reserved: boolean;
    reservationId?: string;
    expiresAt?: string;
    message: string;
}

export interface UsernameConfirmationResponse {
    success: boolean;
    username: string;
    message: string;
}

export interface UserData {
    email: string | null;
    displayName: string;
    photoURL?: string;
    username: string;
    createdAt?: Date;
    updatedAt?: Date;
}

// Consolidated shape the UI can rely on without stitching pieces together
export interface AuthUser {
    uid: string;
    email: string | null;
    displayName: string;
    username: string;
    photoURL: string | null | undefined;
    roles: Role[];
    permissions: Permission[];
    provider: string; // e.g., "password", "google.com"
    isAdmin: boolean;
    isSuper: boolean;
    isArtist: boolean;
    isModerator: boolean;
}