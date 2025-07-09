export interface Artist {
    uid: string;
    displayName?: string;
    photoURL?: string;
    [key: string]: unknown;
}

export type SortBy = "relevance" | "likes" | "latest";
export type Medium = "2D" | "3D" | "miniatures";
export type Subject = "abstract" | "anatomy" | "animals" | "props"; 