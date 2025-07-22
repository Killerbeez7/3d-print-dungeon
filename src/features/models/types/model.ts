import { z } from "zod";

export const modelSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    categoryIds: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    renderFiles: z.array(z.instanceof(File)).optional(),
    renderPreviewUrls: z.array(z.string()).optional(),
    selectedRenderIndex: z.number().optional(),
    price: z.number().optional(),
    isPaid: z.boolean().optional(),
    uploaderId: z.string().optional(),
    uploaderDisplayName: z.string().optional(),
    convertedFileUrl: z.string().optional(),
    originalFileUrl: z.string().optional(),
    renderExtraUrls: z.array(z.string()).optional(),
    posterUrl: z.string().optional(),
    renderPrimaryUrl: z.string().optional(),
    likes: z.number().optional(),
    views: z.number().optional(),
    createdAt: z.union([z.object({ seconds: z.number() }), z.number(), z.string(), z.null()]).optional(),
    /* extra */
    medium: z.string().optional(),
    subjects: z.array(z.string()).optional(),
    subject: z.string().optional(),
    isAI: z.boolean().optional(),
}).catchall(z.unknown());

export type ModelData = z.infer<typeof modelSchema>;










