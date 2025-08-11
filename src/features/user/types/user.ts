import type { User as FirebaseUser } from "firebase/auth";
import type { Timestamp } from "firebase/firestore";


// Domain user data
export interface BaseUser {
    id: string;
    email: string;
    username: string;
    displayName: string;
    photoURL?: string;
    createdAt: Date;
    updatedAt: Date;
}

// Base Firestore user data
export interface RawUserData {
    /* Identity */
    uid: string;
    email: string | null;
    username: string;
    displayName: string;
    photoURL: string | null;
    authProvider: string; // "password", "google.com", etc.

    /* Timestamps */
    createdAt: Timestamp | Date;
    updatedAt: Timestamp | Date;
    lastLoginAt: Timestamp | Date;

    /* Access */
    roles: string[];

    /* Profile */
    profileComplete: boolean;
    preferences: {
        emailNotifications: boolean;
        theme: "light" | "dark" | "auto";
    };

    /* Stats */
    stats: {
        loginCount: number;
        uploadsCount: number;
        likesCount: number;
        viewsCount: number;
        followers: number;
        following: number;
    };

    /* Optional extended fields */
    bio?: string;
    location?: string;
    website?: string;
    socialLinks?: {
        twitter?: string;
        instagram?: string;
        facebook?: string;
    };

    /* Artist extras */
    isArtist?: boolean;
    uploads?: string[];
    featuredWorks?: string[];
    categories?: string[];
    commissionRates?: {
        small: number;
        medium: number;
        large: number;
    };
    portfolio?: {
        featuredWorks: string[];
        categories: string[];
    };

    /* Stripe (seller) */
    stripeConnectId?: string;
}



export interface UserSettings extends RawUserData {
    account: {
        email: string;
        displayName: string;
        photoURL?: string;
    };
    notifications: {
        email: boolean;
        push: boolean;
        marketing: boolean;
    };
    security: {
        twoFactorEnabled: boolean;
        lastPasswordChange: Date;
    };
    privacy: {
        profileVisibility: "public" | "private" | "friends";
        showEmail: boolean;
        showLocation: boolean;
    };
}

// Type aliases for clarity
export type CurrentUser = FirebaseUser;
