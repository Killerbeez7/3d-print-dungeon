import type { RawUserData } from "@/features/auth/types/auth";

export interface ArtistData extends RawUserData {
    uid: string;
    bio?: string;
}