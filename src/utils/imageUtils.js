// thumbnail sizes from the resize extension
export const THUMBNAIL_SIZES = {
    SMALL: "150x150",
    MEDIUM: "400x400",
    LARGE: "800x800",
    XLARGE: "1200x1200",
};

// convert original image URL to thumbnail URL
export function getThumbnailUrl(originalUrl, size = THUMBNAIL_SIZES.MEDIUM) {
    if (!originalUrl) return null;

    // extract file path and name from the URL
    try {
        const url = new URL(originalUrl);
        const pathParam = url.searchParams.get("o") || url.pathname.split("/o/")[1];

        if (!pathParam) return originalUrl;

        // decode the path
        const decodedPath = decodeURIComponent(pathParam);

        // extract directory and filename
        const lastSlashIndex = decodedPath.lastIndexOf("/");
        const directory = decodedPath.substring(0, lastSlashIndex);
        const filename = decodedPath.substring(lastSlashIndex + 1);

        // remove original extension and add size + webp
        const nameWithoutExt = filename.replace(/\.[^.]+$/, "");
        const thumbnailFilename = `${nameWithoutExt}_${size}.webp`;

        // construct thumbnail path
        const thumbnailPath = `${directory}/thumbs/${thumbnailFilename}`;

        // replace original path with thumbnail path in URL
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

// generate multiple thumbnail sizes
export function getResponsiveThumbnails(originalUrl) {
    return {
        small: getThumbnailUrl(originalUrl, THUMBNAIL_SIZES.SMALL),
        medium: getThumbnailUrl(originalUrl, THUMBNAIL_SIZES.MEDIUM),
        large: getThumbnailUrl(originalUrl, THUMBNAIL_SIZES.LARGE),
        xlarge: getThumbnailUrl(originalUrl, THUMBNAIL_SIZES.XLARGE),
    };
}

// get appropriate thumbnail size based on container size or use case
export function getThumbnailSizeForUseCase(useCase) {
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
