import { THUMBNAIL_SIZES, ThumbKey } from "@/constants/thumbnailSizes";

export { THUMBNAIL_SIZES };


export function getThumbnailUrl(
  originalUrl: string | null,
  size: ThumbKey = "SMALL"          // default size: SMALL
): string | null {
  if (!originalUrl) return null;

  const dim = THUMBNAIL_SIZES[size]; // default dimension: "200x200"
  try {
        const url = new URL(originalUrl);
        const pathParam = url.searchParams.get("o") || url.pathname.split("/o/")[1];
        if (!pathParam) return originalUrl;
        const decodedPath = decodeURIComponent(pathParam);
        const lastSlashIndex = decodedPath.lastIndexOf("/");
        const directory = decodedPath.substring(0, lastSlashIndex);
        const filename = decodedPath.substring(lastSlashIndex + 1);
        const nameWithoutExt = filename.replace(/\.[^.]+$/, "");
        const thumbnailFilename = `${nameWithoutExt}_${dim}.webp`;
        const thumbnailPath = `${directory}/thumbs/${thumbnailFilename}`;
        const thumbnailUrl = originalUrl.replace(
            encodeURIComponent(decodedPath),
            encodeURIComponent(thumbnailPath)
        );
        return thumbnailUrl;
    } catch (error) {
        console.error("Error generating thumbnail URL:", error);
        return originalUrl;
    }
}


export function getResponsiveThumbnails(originalUrl: string | null): Record<string, string | null> {
    return {
        small: getThumbnailUrl(originalUrl, "SMALL"),
        medium: getThumbnailUrl(originalUrl, "MEDIUM"),
        large: getThumbnailUrl(originalUrl, "LARGE"),
        xlarge: getThumbnailUrl(originalUrl, "XLARGE"),
    };
}


export function getThumbnailSizeForUseCase(useCase: string): string {
    switch (useCase) {
        case "thumbnail":
        case "small":
            return THUMBNAIL_SIZES.SMALL;
        case "grid":
        case "card":
        default:
            return THUMBNAIL_SIZES.MEDIUM;
        case "large":
        case "detail":
            return THUMBNAIL_SIZES.LARGE;
        case "hero":
        case "xlarge":
            return THUMBNAIL_SIZES.XLARGE;
    }
}
