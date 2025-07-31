import type { User as FirebaseUser } from "firebase/auth";
import type { Timestamp } from "firebase/firestore";

/**
 * USER TYPE ORGANIZATION:
 * 
 * Firestore Layer (Infrastructure):
 * - RawUserData: Raw data from Firestore
 * - CurrentUser: Firebase Auth user object
 * 
 * Domain Layer (Business Logic):
 * - BaseUser: Clean domain model
 * - UserProfile: Extended user profile with artist capabilities
 * - UserSettings: User preferences
 * 
 * Usage:
 * - Use RawUserData/CurrentUser for Firebase operations
 * - Use UserProfile for UI components
 * - Use UserSettings for settings pages
 */

// Domain user data
export interface BaseUser {
    id: string;
    email: string;
    displayName: string;
    photoURL?: string;
    createdAt: Date;
    updatedAt: Date;
}

// Base Firestore user data
export interface RawUserData {
    uid: string;
    stripeConnectId?: string;
    email: string | null | undefined;
    displayName: string | null;
    photoURL: string | null;
    roles?: string[];
    username: string; // Make username required and unique
    createdAt?: Timestamp | Date;
    lastLogin?: Timestamp | Date;
    // Simple artist flag
    isArtist?: boolean;
    // Additional fields for extended user profiles
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
    // Artist-specific fields (only used if isArtist is true)
    uploads?: string[]; // Array of model IDs
    featuredWorks?: string[];
    categories?: string[];
    commissionRates?: {
        small: number;
        medium: number;
        large: number;
    };
    // Flat count fields (better for Firestore)
    uploadsCount?: number;
    likesCount?: number;
    followersCount?: number;
    followingCount?: number;
    // Legacy fields (for backward compatibility)
    totalUploads?: number;
    totalLikes?: number;
    totalViews?: number;
    followers?: number;
    following?: number;
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
