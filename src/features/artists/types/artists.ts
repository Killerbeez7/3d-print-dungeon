import type { RawUserData } from "@/types/user";

export interface ArtistData extends RawUserData {
    uid: string;
    bio?: string;
    displayName: string;
    photoURL: string;
    email: string;
}

export interface ArtistListGridProps {
    artists: ArtistData[];
}

export interface ArtistCardProps {
    uid?: string;
    displayName: string | null;
    photoURL: string | null;
    bio?: string;
}