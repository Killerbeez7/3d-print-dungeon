// Where model files live in Cloud Storage. Shared by the functions and the
// maintenance scripts.

// Original (printable) files. Storage rules deny all reads here; buyers get a
// short-lived signed link from getModelDownloadUrl.
export const PRIVATE_ORIGINALS = "private/originals";

// Where originals were uploaded before they were made private.
export const LEGACY_ORIGINALS = "models/original";

/** Object path inside the bucket for a Firebase download URL, or null. */
export const pathFromDownloadUrl = (url) => {
    if (typeof url !== "string") return null;
    const match = url.match(/\/o\/([^?]+)/);
    if (!match) return null;
    try {
        return decodeURIComponent(match[1]);
    } catch {
        return null;
    }
};

/**
 * Object path of a model's original file. A private path must sit in the
 * uploader's own folder, so a listing can't point at someone else's file.
 */
export const originalPathOf = (model) => {
    const path = model?.originalFilePath;
    if (typeof path === "string") {
        const ownFolder = `${PRIVATE_ORIGINALS}/${model.uploaderId}/`;
        return path.startsWith(ownFolder) && !path.includes("..") ? path : null;
    }
    const legacy = pathFromDownloadUrl(model?.originalFileUrl);
    return legacy && legacy.startsWith(`${LEGACY_ORIGINALS}/`) ? legacy : null;
};
