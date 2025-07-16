export interface Artwork {
    id: string;
    title: string;
    artist: string;
    tags: string[];
    thumbnailUrl: string;
    likes: number;
    views: number;
    createdAt?: { seconds?: number } | number | string | null;
}

export type SortBy = "community" | "popular" | "latest" | "views"; 