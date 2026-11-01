export const STORAGE_PATHS = {
    /** Legacy public originals; new uploads go to PRIVATE_ORIGINALS. */
    ORIGINAL: '/models/original',
    /** Original model files. No browser can read them; see getModelDownloadUrl. */
    PRIVATE_ORIGINALS: 'private/originals',
    CONVERTED: '/models/converted',
    RENDER_PRIMARY: '/models/renders/renderPrimary',
    RENDER_EXTRAS: '/models/renders/renderExtras',
    POSTERS: '/models/posters',
}; 