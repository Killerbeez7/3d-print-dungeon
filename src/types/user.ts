import type { User as FirebaseUser } from "firebase/auth";
import type { Timestamp } from "firebase/firestore";

/**
 * USER TYPE ORGANIZATION:
 * 
 * Firebase Layer (Infrastructure):
 * - RawUserData: Raw data from Firestore
 * - CurrentUser: Firebase Auth user object
 * 
 * Domain Layer (Business Logic):
 * - BaseUser: Clean domain model
 * - UserProfile: Extended user profile
 * - ArtistProfile: Artist-specific profile
 * - UserSettings: User preferences
 * 
 * Usage:
 * - Use RawUserData/CurrentUser for Firebase operations
 * - Use UserProfile/ArtistProfile for UI components
 * - Use UserSettings for settings pages
 */

// Base Firebase user data (from Firestore)
export interface RawUserData {
    uid: string;
    stripeConnectId?: string;
    email: string | null | undefined;
    displayName: string | null;
    photoURL: string | null;
    roles?: string[];
    username?: string;
    searchableName?: string;
    createdAt?: Timestamp | Date;
    lastLogin?: Timestamp | Date;
}

// Domain models (for UI and business logic)
export interface BaseUser {
    id: string;
    email: string;
    displayName: string;
    photoURL?: string;
    createdAt: Date;
    updatedAt: Date;
}


export interface UserProfile extends BaseUser {
    bio?: string;
    location?: string;
    website?: string;
    socialLinks?: {
        twitter?: string;
        instagram?: string;
        facebook?: string;
    };
    preferences?: {
        emailNotifications: boolean;
        pushNotifications: boolean;
        privacyLevel: "public" | "private" | "friends";
    };
}

export interface ArtistProfile extends UserProfile {
    isArtist: true;
    portfolio: {
        featuredWorks: string[];
        categories: string[];
        commissionRates?: {
            small: number;
            medium: number;
            large: number;
        };
    };
    stats: {
        totalUploads: number;
        totalLikes: number;
        totalViews: number;
        followers: number;
        following: number;
    };
}

export interface UserSettings {
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

// Utility types for converting between Firebase and domain models
export type UserProfileFromFirebase = Omit<UserProfile, "id" | "createdAt" | "updatedAt"> & {
    uid: string;
    createdAt?: Timestamp | Date;
    lastLogin?: Timestamp | Date;
};