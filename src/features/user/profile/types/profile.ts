import type { Timestamp } from "firebase/firestore";

export interface PublicProfile {
  username: string;
  displayName: string;
  photoURL?: string | null;

  bio?: string | null;
  location?: string | null;
  website?: string | null;

  socialLinks?: {
    twitter?: string | null;
    instagram?: string | null;
    facebook?: string | null;
    linkedin?: string | null;
    youtube?: string | null;
  };

  stats: {
    followersCount: number;
    followingCount: number;
    postsCount: number;
    likesCount: number;
    viewsCount: number;
    uploadsCount: number;
  };

  isArtist?: boolean;
  isVerified?: boolean;
  isPremium?: boolean;

  artistCategories?: string[];
  featuredWorks?: string[];

  publicCommissionRates?: {
    small: number;
    medium: number;
    large: number;
  };

  joinedAt: Timestamp | Date;
  lastActiveAt: Timestamp | Date;
}

export type PublicProfileView = PublicProfile & {
  uid: string;
};

export interface Tab {
  id: string;
  label: string;
  icon: string;
  count?: number;
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
export type LikedSortOption =
  | "recentlyLiked"
  | "mostLiked"
  | "mostViewed"
  | "name"
  | "artist";
