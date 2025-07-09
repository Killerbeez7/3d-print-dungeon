import { THUMBNAIL_SIZES } from "@/constants/thumbnailSizes";

export { THUMBNAIL_SIZES };


export function getThumbnailUrl(originalUrl: string | null, size: string = THUMBNAIL_SIZES.MEDIUM): string | null {
    if (!originalUrl) return null;
    try {
        const url = new URL(originalUrl);
        const pathParam = url.searchParams.get("o") || url.pathname.split("/o/")[1];
        if (!pathParam) return originalUrl;
        const decodedPath = decodeURIComponent(pathParam);
        const lastSlashIndex = decodedPath.lastIndexOf("/");
        const directory = decodedPath.substring(0, lastSlashIndex);
        const filename = decodedPath.substring(lastSlashIndex + 1);
        const nameWithoutExt = filename.replace(/\.[^.]+$/, "");
        const thumbnailFilename = `${nameWithoutExt}_${size}.webp`;
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
        small: getThumbnailUrl(originalUrl, THUMBNAIL_SIZES.SMALL),
        medium: getThumbnailUrl(originalUrl, THUMBNAIL_SIZES.MEDIUM),
        large: getThumbnailUrl(originalUrl, THUMBNAIL_SIZES.LARGE),
        xlarge: getThumbnailUrl(originalUrl, THUMBNAIL_SIZES.XLARGE),
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
