import { db, storage } from "../config/firebase";
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
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { finalConvertFileToGLB } from "../utils/models/converter";
import { STORAGE_PATHS } from '../constants/storagePaths';
import type { ModelData } from "../types/model";

export interface CreateModelParams {
    name: string;
    description: string;
    category: string;
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
    category,
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
}: CreateModelParams): Promise<CreateModelResult> {
    const progressFn = onProgress || (() => { });
    let progress = 0;
    progressFn(progress);

    // original 3D file
    const origRef = ref(storage, `${STORAGE_PATHS.ORIGINAL}/${file.name}`);
    const origTask = uploadBytesResumable(origRef, file);
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
        const convTask = uploadBytesResumable(convRef, blob);
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
            const pTask = uploadBytesResumable(pRef, primary);
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
                    const xTask = uploadBytesResumable(xRef, extra);
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
        const postTask = uploadBytesResumable(postRef, posterBlob);
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
        category,
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

export const PAGE_SIZE = 30;

/**
 * Fetch models with pagination.
 */
export async function fetchModels(pageParam?: QueryDocumentSnapshot<DocumentData>): Promise<{
    models: ModelData[];
    nextCursor: QueryDocumentSnapshot<DocumentData> | undefined;
}> {
    const base = query(collection(db, "models"), orderBy("createdAt", "desc"));
    const q = pageParam
        ? query(base, startAfter(pageParam), limit(PAGE_SIZE))
        : query(base, limit(PAGE_SIZE));
    const snap = await getDocs(q);
    return {
        models: snap.docs.map((d) => ({
            ...(d.data() as ModelData),
            id: d.id,
        })),
        nextCursor:
            snap.docs.length === PAGE_SIZE ? snap.docs[snap.docs.length - 1] : undefined,
    };
}
