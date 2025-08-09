export interface Tab {
    id: string;
    label: string;
    icon: string;
    count?: number;
}

export interface UserProfileValues {
    uid: string;
    displayName: string;
    username: string;
    email: string;
    photoURL?: string;
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
    stats: {
        uploadsCount: number;
        followers: number;
        following: number;
        likesCount: number;
        viewsCount: number;
        collectionsCount: number;
    };
    createdAt: Date;
    updatedAt: Date;
    isVerified: boolean;
    isPremium: boolean;
    preferences: {
        emailNotifications: boolean;
        pushNotifications: boolean;
        publicProfile: boolean;
        showEmail: boolean;
    };
}

export interface UploadedArtwork {
    id: string;
    name?: string;
    renderPrimaryUrl?: string;
    likes?: number;
    views?: number;
    createdAt?: Date;
    category?: string;
    tags?: string[];
    description?: string;
}

export interface LikedArtwork {
    id: string;
    title: string;
    artist: string;
    artistId: string;
    imageUrl: string;
    likes: number;
    views: number;
    category?: string;
    tags?: string[];
    description?: string;
    likedAt?: Date;
}

export interface UserCollection {
    id: string;
    name: string;
    description?: string;
    isPublic: boolean;
    modelCount: number;
    coverImage?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ChartData {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        backgroundColor: string[];
        borderColor: string[];
        borderWidth: number;
    }[];
}

export type SortOption = "newest" | "oldest" | "mostLiked" | "mostViewed" | "name";
export type LikedSortOption = "recentlyLiked" | "mostLiked" | "mostViewed" | "name" | "artist";