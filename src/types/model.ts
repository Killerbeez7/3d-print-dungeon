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
} 