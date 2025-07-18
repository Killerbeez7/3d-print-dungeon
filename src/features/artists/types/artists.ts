import type { RawUserData } from "@/features/auth/types/auth";

export interface Artist extends RawUserData {
    id: string;
    bio?: string;
}