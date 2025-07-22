import type { RawUserData } from "@/features/auth/types/auth";

export interface ArtistData extends RawUserData {
    id: string;
    bio?: string;
}