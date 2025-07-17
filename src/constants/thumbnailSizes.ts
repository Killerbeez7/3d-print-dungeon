export const THUMBNAIL_SIZES = {
  SMALL:  "200x200",
  MEDIUM: "400x400",
  LARGE:  "800x800",
  XLARGE: "1200x1200",
} as const;

export type ThumbKey = keyof typeof THUMBNAIL_SIZES;