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

        // Separate directory and filename, taking into account existing "/thumbs/" folders
        let baseDirectory: string;
        let filename: string;

        if (decodedPath.includes("/thumbs/")) {
            const [dir, file] = decodedPath.split("/thumbs/");
            baseDirectory = dir; // path before the existing "thumbs" segment
            filename = file;     // filename that follows
        } else {
            const lastSlashIndex = decodedPath.lastIndexOf("/");
            baseDirectory = decodedPath.substring(0, lastSlashIndex);
            filename = decodedPath.substring(lastSlashIndex + 1);
        }

        // Remove file extension and any existing dimension suffix (e.g. _200x200)
        const nameWithoutExt = filename
            .replace(/\.[^.]+$/, "") // remove extension
            .replace(/_\d+x\d+$/, ""); // strip existing size suffix if present
        const thumbnailFilename = `${nameWithoutExt}_${dim}.webp`;
        const thumbnailPath = `${baseDirectory}/thumbs/${thumbnailFilename}`;
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
