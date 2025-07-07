export interface Model {
    id: string;
    name: string;
    description?: string;
    category?: string;
    tags?: string[];
    uploaderId?: string;
    uploaderDisplayName?: string;
    originalFileUrl?: string;
    convertedFileUrl?: string;
    renderPrimaryUrl?: string;
    renderExtraUrls?: string[];
    posterUrl?: string;
    price?: number;
    isPaid?: boolean;
    currency?: string;
    createdAt?: { seconds?: number } | number | string | null;
    views?: number;
    likes?: number;
    purchaseCount?: number;
    totalRevenue?: number;
    [key: string]: unknown;
} 