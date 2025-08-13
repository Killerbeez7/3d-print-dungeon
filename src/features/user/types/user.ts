import type { User as FirebaseUser } from "firebase/auth";
import type { Timestamp } from "firebase/firestore";

// Type aliases for clarity
export type CurrentUser = FirebaseUser;

// ===== ROLE & PERMISSION TYPES =====
export type Role =
    | "user"
    | "artist"
    | "moderator"
    | "admin"
    | "superadmin";

export type Permission =
    | "read:models"
    | "write:models"
    | "moderate:forum"
    | "manage:users"
    | "manage:billing"
    | "manage:content";

// ===== PUBLIC PROFILE (Readable by anyone) =====
export interface PublicProfile {
    /* Identity */
    username: string;
    displayName: string;
    photoURL?: string;

    /* Profile */
    bio?: string;
    location?: string;
    website?: string;
    socialLinks?: {
        twitter?: string;
        instagram?: string;
        facebook?: string;
        linkedin?: string;
        youtube?: string;
    };

    /* Stats (aggregated for performance) */
    stats: {
        followersCount: number;
        followingCount: number;
        postsCount: number;
        likesCount: number;
        viewsCount: number;
        uploadsCount: number;
    };

    /* Artist-specific public data */
    isArtist?: boolean;
    isVerified?: boolean;
    isPremium?: boolean;
    artistCategories?: string[];
    featuredWorks?: string[];
    // Only include if rates are intentionally public-facing
    publicCommissionRates?: {
        small: number;
        medium: number;
        large: number;
    };

    /* Timestamps */
    joinedAt: Timestamp | Date;
    lastActiveAt: Timestamp | Date;
}

// View types for frontend consumption without mapping
export type PublicProfileView = PublicProfile & { uid: string };

// ===== PRIVATE PROFILE (User only) =====
export interface PrivateProfile {
    /* Identity */
    uid: string;
    email: string | null;
    authProvider: string; // "password", "google.com", etc.

    /* Authentication metadata */
    emailVerified: boolean;
    phoneNumber?: string;
    dateOfBirth?: Date;

    /* Access control */
    roles: Role[];
    permissions: Permission[];

    /* Account status */
    profileComplete: boolean;
    accountStatus: "active" | "suspended" | "deleted";
    suspensionReason?: string;

    /* Timestamps */
    createdAt: Timestamp | Date;
    updatedAt: Timestamp | Date;
    lastLoginAt: Timestamp | Date;
    lastPasswordChange?: Timestamp | Date;

    /* Stripe customer (buyer side). Seller Stripe Connect is stored in ArtistPrivateProfile */
    stripeCustomerId?: string;

    /* Internal tracking */
    loginCount: number;
}

// ===== USER SETTINGS (User only) =====
export interface UserSettings {
    /* Notifications */
    notifications: {
        email: boolean;
        push: boolean;
        marketing: boolean;
        newFollowers: boolean;
        newLikes: boolean;
        newComments: boolean;
        modelUpdates: boolean;
    };

    /* Appearance */
    theme: "light" | "dark" | "auto";
    language: string;
    timezone: string;

    /* Privacy */
    privacy: {
        profileVisibility: "public" | "private" | "friends";
        showEmail: boolean;
        showLocation: boolean;
        showLastActive: boolean;
        allowMessages: "everyone" | "followers" | "none";
    };

    /* Security */
    security: {
        twoFactorEnabled: boolean;
        sessionTimeout: number; // minutes
        loginNotifications: boolean;
    };

    /* Artist settings */
    artistSettings?: {
        autoApproveComments: boolean;
        commissionEnabled: boolean;
        portfolioVisibility: "public" | "private";
    };
}



// ===== ARTIST PRIVATE PROFILE (usersPrivate/{uid}/artistProfile) =====
export interface ArtistPrivateProfile {
    /* Stripe Connect (seller) */
    stripeConnectId?: string;

    /* Tax and payout */
    taxSettings?: {
        taxRatePercent?: number;
        country?: string;
        region?: string;
    };
    payoutSettings?: {
        defaultCurrency: string; // e.g., "USD"
        automaticPayouts: boolean;
    };

    /* Private commission configuration */
    commissionRates?: {
        small: number;
        medium: number;
        large: number;
    };

    /* Compliance */
    kyc: {
        status: "pending" | "verified" | "restricted";
        lastReviewAt?: Timestamp | Date;
    };

    /* Optional extras */
    portfolio?: {
        featuredWorks: string[];
    };
    notes?: string;

    /* Timestamps */
    createdAt: Timestamp | Date;
    updatedAt: Timestamp | Date;
}

// ===== SUBCOLLECTION DOCS (usersPrivate/{uid}/uploads|purchases) =====
export interface PrivateUploadDoc {
    modelId: string; // doc id mirrors modelId
    addedAt: Timestamp | Date;
}

export interface PrivatePurchaseDoc {
    modelId: string; // doc id mirrors modelId
    purchasedAt: Timestamp | Date;
    pricePaidCents: number;
    currency: string; // e.g., "USD"
}

