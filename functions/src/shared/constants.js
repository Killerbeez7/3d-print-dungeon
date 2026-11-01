const COOLDOWN_MS = 60 * 60 * 1000; // 1 hour
const BATCH_SIZE = 100;
const VIEW_BUFFER_COLLECTION = "viewBuffer";
// Last counted view per model and viewer, for the cooldown.
const RECENT_VIEWS_COLLECTION = "recentViews";

export const constants = {
    COOLDOWN_MS,
    BATCH_SIZE,
    VIEW_BUFFER_COLLECTION,
    RECENT_VIEWS_COLLECTION,
};