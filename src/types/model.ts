export interface ModelData {
    id: string;
    name: string;
    description: string;
    category: string;
    tags: string[];
    renderFiles: File[];
    renderPreviewUrls: string[];
    selectedRenderIndex: number;
    price: number;
    isPaid: boolean;
    uploaderId: string;
    uploaderDisplayName: string;
    convertedFileUrl: string;
    originalFileUrl: string;
    renderExtraUrls: string[];
    posterUrl?: string;
    renderPrimaryUrl: string;
    likes?: number;
    views?: number;
    createdAt?: { seconds?: number } | number | string | null;
    medium?: string;
    subjects?: string[];
    subject?: string;
    isAI?: boolean;
    [key: string]: unknown;
}










