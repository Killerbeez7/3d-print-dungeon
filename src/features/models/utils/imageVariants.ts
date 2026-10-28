const STORAGE_PREFIX = "https://firebasestorage.googleapis.com/v0/b/";

export type ThumbSize = 400 | 800;

/**
 * URL of the resized copy made by the storage-resize-images extension
 * (models/renders/.../thumbs/<name>_<size>x<size>.webp), or null when the
 * image isn't a render in Firebase Storage. The thumb may not exist (older
 * uploads weren't backfilled), so callers must fall back to the original.
 */
export function getThumbUrl(url: string | null | undefined, size: ThumbSize): string | null {
    if (!url || !url.startsWith(STORAGE_PREFIX)) return null;

    const match = new URL(url).pathname.match(/^\/v0\/b\/([^/]+)\/o\/(.+)$/);
    if (!match) return null;

    const [, bucket, encodedPath] = match;
    const path = decodeURIComponent(encodedPath);
    const slash = path.lastIndexOf("/");
    const dir = path.slice(0, slash);
    if (!dir.startsWith("models/renders")) return null;

    const name = path
        .slice(slash + 1)
        .replace(/\.[^.]+$/, "")
        .replace(/_\d+x\d+$/, "");
    const thumbDir = dir.endsWith("/thumbs") ? dir : `${dir}/thumbs`;
    const thumbPath = `${thumbDir}/${name}_${size}x${size}.webp`;

    // Renders are publicly readable, so no download token is needed.
    return `${STORAGE_PREFIX}${bucket}/o/${encodeURIComponent(thumbPath)}?alt=media`;
}

// If the first few thumbs all fail, stop trying them for this session.
const thumbStats = { loaded: 0, failed: 0 };

export const thumbsLikelyMissing = () => thumbStats.loaded === 0 && thumbStats.failed >= 4;

export const reportThumbResult = (loaded: boolean) => {
    if (loaded) thumbStats.loaded += 1;
    else thumbStats.failed += 1;
};
