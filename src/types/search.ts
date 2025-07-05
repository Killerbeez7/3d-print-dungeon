export interface Artist {
    uid: string;
    displayName?: string;
    photoURL?: string;
    [key: string]: unknown;
}

export interface Model {
    id: string;
    name: string;
    renderPrimaryUrl: string;
    uploaderDisplayName: string;
    medium?: string;
    subjects?: string[];
    subject?: string;
    isAI?: boolean;
    likes?: number;
    createdAt?: { seconds: number } | Date;
    [key: string]: unknown;
}

export type SortBy = "relevance" | "likes" | "latest";
export type Medium = "2D" | "3D" | "miniatures";
export type Subject = "abstract" | "anatomy" | "animals" | "props"; 