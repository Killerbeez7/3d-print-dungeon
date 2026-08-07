import { Timestamp } from "firebase/firestore";
import { z } from "zod";

const dateSchema = z
  .union([z.instanceof(Timestamp), z.date(), z.string(), z.number(), z.null()])
  .optional();

export const modelSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),

  categoryIds: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),

  price: z.number().optional(),
  isPaid: z.boolean().optional(),
  currency: z.string().optional(),
  isAI: z.boolean().optional(),

  uploaderId: z.string().optional(),
  uploaderUsername: z.string().optional(),
  uploaderDisplayName: z.string().optional(),

  originalFileUrl: z.string().optional(),
  convertedFileUrl: z.string().optional(),

  renderPrimaryUrl: z.string().nullable().optional(),
  renderExtraUrls: z.array(z.string()).optional(),
  posterUrl: z.string().nullable().optional(),

  views: z.number().optional(),
  likes: z.number().optional(),
  purchaseCount: z.number().optional(),
  totalRevenue: z.number().optional(),

  createdAt: dateSchema,
  updatedAt: dateSchema,
  lastViewed: dateSchema,
  lastPurchased: dateSchema,
});

export type ModelData = z.infer<typeof modelSchema>;

export interface ModelUploadData {
  name: string;
  description: string;
  categoryIds: string[];
  tags: string[];

  renderFiles: File[];
  renderPreviewUrls: string[];
  selectedRenderIndex: number;

  price: number;
  isPaid: boolean;
  isAI: boolean;
}

export type ModelUpdateData = Partial<
  Pick<ModelData, "name" | "description" | "tags" | "categoryIds" | "price" | "isPaid">
>;

export interface ModelStats {
  views: number;
  likes: number;
  purchaseCount: number;
  totalRevenue: number;
}
