import type { ModelData } from "@/features/models/types/model";

/**
 * The first rows of the home gallery, kept in this browser so the next visit
 * paints them at once (their images are already cached) while fresh data loads.
 * Only what a gallery tile shows is kept.
 */
const STORAGE_KEY = "home-gallery-v1";
const MAX_MODELS = 28;
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

type TileModel = Pick<
    ModelData,
    "id" | "name" | "renderPrimaryUrl" | "isPaid" | "price" | "currency" | "uploaderDisplayName"
>;

interface Snapshot {
    savedAt: number;
    galleries: Record<string, TileModel[]>;
}

const read = (): Snapshot | null => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const snapshot = JSON.parse(raw) as Snapshot;
        if (!snapshot?.galleries || Date.now() - snapshot.savedAt > MAX_AGE_MS) return null;
        return snapshot;
    } catch {
        return null;
    }
};

export const readHomeSnapshot = (key: string): ModelData[] | undefined => {
    const models = read()?.galleries[key];
    return Array.isArray(models) && models.length ? models : undefined;
};

export const writeHomeSnapshot = (key: string, models: ModelData[]): void => {
    try {
        const snapshot = read() ?? { savedAt: Date.now(), galleries: {} };
        snapshot.savedAt = Date.now();
        snapshot.galleries[key] = models.slice(0, MAX_MODELS).map((model) => ({
            id: model.id,
            name: model.name,
            renderPrimaryUrl: model.renderPrimaryUrl ?? null,
            isPaid: model.isPaid,
            price: model.price,
            currency: model.currency,
            uploaderDisplayName: model.uploaderDisplayName,
        }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch {
        // Storage full or blocked: the gallery simply loads as usual next time.
    }
};
