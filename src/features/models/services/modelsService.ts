import { db, storage } from "../../../config/firebaseConfig";
import {
    collection,
    addDoc,
    serverTimestamp,
    doc,
    updateDoc,
    arrayUnion,
    increment,
    query,
    orderBy,
    limit,
    getDocs,
    startAfter,
    QueryDocumentSnapshot,
    DocumentData,
    where,
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { finalConvertFileToGLB } from "../utils/converter";
import { STORAGE_PATHS } from '../../../constants/storagePaths';
import type { ModelData } from "../types/model";

export interface CreateModelParams {
    name: string;
    description: string;
    categoryIds: string[];
    tags: string[];
    file: File;
    renderFiles: File[];
    selectedRenderIndex: number;
    uploaderId: string;
    uploaderDisplayName: string;
    onProgress?: (progress: number) => void;
    posterBlob?: Blob;
    preConvertedFile?: Blob;
    price?: number;
    isPaid?: boolean;
    isAI?: boolean;
}

export interface CreateModelResult {
    modelId: string;
    originalFileUrl: string;
    convertedFileUrl: string;
    renderPrimaryUrl: string | null;
    renderExtraUrls: string[];
    posterUrl: string | null;
}

/**
 * Create a new 3D model and upload all related files.
 */
export async function createAdvancedModel({
    name,
    description,
    categoryIds,
    tags,
    file,
    renderFiles,
    selectedRenderIndex,
    uploaderId,
    uploaderDisplayName,
    onProgress,
    posterBlob,
    preConvertedFile,
    price = 0,
    isPaid = false,
    isAI = false,
}: CreateModelParams): Promise<CreateModelResult> {
    const progressFn = onProgress || (() => { });
    let progress = 0;
    progressFn(progress);

    // original 3D file
    const origRef = ref(storage, `${STORAGE_PATHS.ORIGINAL}/${file.name}`);
    const origTask = uploadBytesResumable(origRef, file, {
        contentType: file.type,
        cacheControl: "public,max-age=31536000,immutable"
    });
    const originalFileUrl: string = await new Promise((res, rej) => {
        origTask.on(
            "state_changed",
            (snap) => {
                progress = (snap.bytesTransferred / snap.totalBytes) * 20;
                progressFn(progress);
            },
            rej,
            async () => res(await getDownloadURL(origTask.snapshot.ref))
        );
    });

    // convert to GLB
    const lower = file.name.toLowerCase();
    let convertedFileUrl: string = originalFileUrl;
    if (lower.endsWith(".stl") || lower.endsWith(".obj")) {
        const blob = preConvertedFile
            ? preConvertedFile
            : (await finalConvertFileToGLB(file)).blob;
        const base = file.name.replace(/\.[^.]+$/, "");
        const convRef = ref(storage, `${STORAGE_PATHS.CONVERTED}/${base}.glb`);
        const convTask = uploadBytesResumable(convRef, blob, {
            contentType: "model/gltf-binary",
            cacheControl: "public,max-age=31536000,immutable"
        });
        convertedFileUrl = await new Promise((res, rej) => {
            convTask.on(
                "state_changed",
                (snap) => {
                    const offset = 20 + (snap.bytesTransferred / snap.totalBytes) * 20;
                    progressFn(offset);
                },
                rej,
                async () => res(await getDownloadURL(convTask.snapshot.ref))
            );
        });
    } else {
        progressFn(40);
    }

    // renders: one primary, rest extras
    let renderPrimaryUrl: string | null = null;
    let renderExtraUrls: string[] = [];

    if (renderFiles?.length) {
        // primary
        const primary = renderFiles[selectedRenderIndex];
        if (primary) {
            const pRef = ref(storage, `${STORAGE_PATHS.RENDER_PRIMARY}/${primary.name}`);
            const pTask = uploadBytesResumable(pRef, primary, {
                contentType: primary.type,
                cacheControl: "public,max-age=31536000,immutable"
            });
            renderPrimaryUrl = await new Promise((res, rej) => {
                pTask.on(
                    "state_changed",
                    () => { },
                    rej,
                    async () => {
                        res(await getDownloadURL(pTask.snapshot.ref));
                    }
                );
            });
        }

        // extras
        renderExtraUrls = await Promise.all(
            renderFiles
                .filter((_, i) => i !== selectedRenderIndex)
                .map(async (extra) => {
                    const xRef = ref(
                        storage,
                        `${STORAGE_PATHS.RENDER_EXTRAS}/${extra.name}`
                    );
                    const xTask = uploadBytesResumable(xRef, extra, {
                        contentType: extra.type,
                        cacheControl: "public,max-age=31536000,immutable"
                    });
                    return await new Promise<string>((res, rej) => {
                        xTask.on(
                            "state_changed",
                            () => { },
                            rej,
                            async () => {
                                res(await getDownloadURL(xTask.snapshot.ref));
                            }
                        );
                    });
                })
        );
        progressFn(60);
    }

    // create poster for model-viewer
    let posterUrl: string | null = null;
    if (posterBlob) {
        const postRef = ref(storage, `${STORAGE_PATHS.POSTERS}/${file.name}.webp`);
        const postTask = uploadBytesResumable(postRef, posterBlob, {
            contentType: "image/webp",
            cacheControl: "public,max-age=31536000,immutable"
        });
        posterUrl = await new Promise((res, rej) => {
            postTask.on(
                "state_changed",
                () => { },
                rej,
                async () => {
                    res(await getDownloadURL(postTask.snapshot.ref));
                }
            );
        });
    }
    progressFn(80);

    // write Firestore
    const modelDoc = await addDoc(collection(db, "models"), {
        name,
        description,
        categoryIds,
        tags,
        uploaderId,
        uploaderDisplayName,
        originalFileUrl,
        convertedFileUrl,
        renderPrimaryUrl,
        renderExtraUrls,
        posterUrl,
        price: parseFloat(String(price)) || 0,
        isPaid: Boolean(isPaid),
        isAI: Boolean(isAI),
        currency: "usd",
        createdAt: serverTimestamp(),
        views: 0,
        likes: 0,
        purchaseCount: 0,
        totalRevenue: 0,
    });

    // link to user
    await updateDoc(doc(db, "users", uploaderId), {
        uploads: arrayUnion(modelDoc.id),
        artist: true,
    });

    progressFn(100);
    return {
        modelId: modelDoc.id,
        originalFileUrl,
        convertedFileUrl,
        renderPrimaryUrl,
        renderExtraUrls,
        posterUrl,
    };
}

/**
 * Increment the view count for a model.
 */
export const incrementModelViews = async (modelId: string): Promise<void> => {
    try {
        const modelRef = doc(db, "models", modelId);
        await updateDoc(modelRef, {
            views: increment(1),
            lastViewed: serverTimestamp(),
        });
    } catch (error) {
        console.error("Error incrementing views:", error);
    }
};

export const PAGE_SIZE = 32;

export interface FetchModelsOptions {
    cursor?: QueryDocumentSnapshot<DocumentData>;
    limit?: number;
    categoryIds?: string[]; // array of category document ids
    search?: string;
    hideAI?: boolean;
}

/**
 * Fetch models with pagination + optional filters
 */
export async function fetchModels(opts: FetchModelsOptions = {}): Promise<{
    models: ModelData[];
    nextCursor?: QueryDocumentSnapshot<DocumentData>;
}> {
    const {
        cursor,
        limit: lim = PAGE_SIZE,
        search,
        hideAI,
    } = opts;

    let q = query(collection(db, "models"), orderBy("createdAt", "desc"));

    if (opts.categoryIds?.length) {
        q = query(
            q,
            where("categoryIds", "array-contains-any", opts.categoryIds.slice(0, 10))
        );
    }
    if (search) {
        // For now, we'll fetch all models and filter client-side
        // This is not ideal for large datasets but works for development
        // In production, consider using Algolia or Firebase Extensions
        
        // First try to find by name prefix (most efficient)
        const nameQuery = query(
            collection(db, "models"),
            where("name", ">=", search),
            where("name", "<=", search + "\uf8ff"),
            orderBy("createdAt", "desc"),
            limit(lim)
        );
        
        const nameSnap = await getDocs(nameQuery);
        const nameMatches = nameSnap.docs.map((d) => ({ ...(d.data() as ModelData), id: d.id }));
        
        // If we have enough results, return them
        if (nameMatches.length >= lim) {
            return {
                models: nameMatches,
                nextCursor: nameMatches.length === lim ? nameSnap.docs[nameSnap.docs.length - 1] : undefined,
            };
        }
        
        // Otherwise, fetch more and filter client-side
        const allQuery = query(
            collection(db, "models"),
            orderBy("createdAt", "desc"),
            limit(100) // Fetch more to filter from
        );
        
        const allSnap = await getDocs(allQuery);
        const allModels = allSnap.docs.map((d) => ({ ...(d.data() as ModelData), id: d.id }));
        
        // Filter by search term across multiple fields (name, description, tags only)
        const filteredModels = allModels.filter((model) => {
            const searchLower = search.toLowerCase();
            return (
                model.name?.toLowerCase().includes(searchLower) ||
                model.description?.toLowerCase().includes(searchLower) ||
                model.tags?.some(tag => tag.toLowerCase().includes(searchLower))
            );
        });
        
        return {
            models: filteredModels.slice(0, lim),
            nextCursor: filteredModels.length > lim ? allSnap.docs[allSnap.docs.length - 1] : undefined,
        };
    }
    if (hideAI) {
        q = query(q, where("isAI", "==", false));
    }

    q = cursor ? query(q, startAfter(cursor), limit(lim)) : query(q, limit(lim));

    const snap = await getDocs(q);
    return {
        models: snap.docs.map((d) => ({ ...(d.data() as ModelData), id: d.id })),
        nextCursor:
            snap.docs.length === lim ? snap.docs[snap.docs.length - 1] : undefined,
    };
}


