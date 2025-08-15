import type { PublicProfileView } from "@/features/user/types/user";

export interface ArtistData extends PublicProfileView {
    bio?: string;
    // These fields are already in PublicProfileView, but keeping for backward compatibility
    displayName: string;
    photoURL?: string;
    username: string;
    // Note: email is not available in public profile for privacy
}

export interface ArtistListGridProps {
    artists: ArtistData[];
}

export interface ArtistCardProps {
    uid?: string;
    displayName: string | null;
    username?: string | null;
    photoURL?: string | null;
    bio?: string;
}