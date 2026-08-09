import { httpsCallable } from "firebase/functions";
import {
    doc,
    addDoc,
    updateDoc,
    collection,
    runTransaction,
    serverTimestamp,
} from "firebase/firestore";
import {
    ref,
    getDownloadURL,
    uploadBytesResumable,
    type StorageReference,
    type UploadTaskSnapshot,
} from "firebase/storage";
import { db, functions, storage } from "@/config/firebaseConfig";
import { STORAGE_PATHS } from "@/constants/storagePaths";
import type { ModelUpdateData } from "@/features/models/types/model";
import { finalConvertFileToGLB } from "@/features/models/utils/converter";

const CACHE_CONTROL = "public,max-age=31536000,immutable";

function uploadAndGetUrl(
    fileRef: StorageReference,
    data: Blob,
    contentType: string,
    onProgress?: (snapshot: UploadTaskSnapshot) => void
): Promise<string> {
    const task = uploadBytesResumable(fileRef, data, {
        contentType: contentType || "application/octet-stream",
        cacheControl: CACHE_CONTROL,
    });

    return new Promise((resolve, reject) => {
        task.on(
            "state_changed",
            (snapshot) => {
                onProgress?.(snapshot);
            },
            reject,
            () => {
                getDownloadURL(task.snapshot.ref)
                    .then(resolve)
                    .catch(reject);
            }
        );
    });
}

export interface CreateModelParams {
    name: string;
    description: string;
    categoryIds: string[];
    tags: string[];
    file: File;
    renderFiles: File[];
    selectedRenderIndex: number;
    uploaderId: string;
    uploaderUsername: string;
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

export async function createAdvancedModel({
    name,
    description,
    categoryIds,
    tags,
    file,
    renderFiles,
    selectedRenderIndex,
    uploaderId,
    uploaderUsername,
    uploaderDisplayName,
    onProgress,
    posterBlob,
    preConvertedFile,
    price = 0,
    isPaid = false,
    isAI = false,
}: CreateModelParams): Promise<CreateModelResult> {
    const progressFn = onProgress ?? (() => undefined);

    // Unique folder prevents files with the same name from overwriting each other.
    const uploadKey = `${uploaderId}/${crypto.randomUUID()}`;

    progressFn(0);

    // Upload original model file.
    const originalRef = ref(
        storage,
        `${STORAGE_PATHS.ORIGINAL}/${uploadKey}/${file.name}`
    );

    const originalFileUrl = await uploadAndGetUrl(
        originalRef,
        file,
        file.type,
        (snapshot) => {
            const progress =
                (snapshot.bytesTransferred / snapshot.totalBytes) * 20;

            progressFn(progress);
        }
    );

    // Convert STL/OBJ models to GLB when needed.
    const lowerFileName = file.name.toLowerCase();

    let convertedFileUrl = originalFileUrl;

    if (
        lowerFileName.endsWith(".stl") ||
        lowerFileName.endsWith(".obj")
    ) {
        const convertedBlob =
            preConvertedFile ?? (await finalConvertFileToGLB(file)).blob;

        const baseName = file.name.replace(/\.[^.]+$/, "");

        const convertedRef = ref(
            storage,
            `${STORAGE_PATHS.CONVERTED}/${uploadKey}/${baseName}.glb`
        );

        convertedFileUrl = await uploadAndGetUrl(
            convertedRef,
            convertedBlob,
            "model/gltf-binary",
            (snapshot) => {
                const progress =
                    20 +
                    (snapshot.bytesTransferred / snapshot.totalBytes) * 20;

                progressFn(progress);
            }
        );
    } else {
        progressFn(40);
    }

    // Upload primary and additional renders.
    let renderPrimaryUrl: string | null = null;
    let renderExtraUrls: string[] = [];

    if (renderFiles.length > 0) {
        const primaryRender = renderFiles[selectedRenderIndex];

        if (primaryRender) {
            const primaryRef = ref(
                storage,
                `${STORAGE_PATHS.RENDER_PRIMARY}/${uploadKey}/${primaryRender.name}`
            );

            renderPrimaryUrl = await uploadAndGetUrl(
                primaryRef,
                primaryRender,
                primaryRender.type
            );
        }

        const extraRenders = renderFiles.filter(
            (_, index) => index !== selectedRenderIndex
        );

        renderExtraUrls = await Promise.all(
            extraRenders.map((extra) => {
                const extraRef = ref(
                    storage,
                    `${STORAGE_PATHS.RENDER_EXTRAS}/${uploadKey}/${extra.name}`
                );

                return uploadAndGetUrl(
                    extraRef,
                    extra,
                    extra.type
                );
            })
        );

        progressFn(60);
    }

    // Upload generated model-viewer poster.
    let posterUrl: string | null = null;

    if (posterBlob) {
        const baseName = file.name.replace(/\.[^.]+$/, "");

        const posterRef = ref(
            storage,
            `${STORAGE_PATHS.POSTERS}/${uploadKey}/${baseName}.webp`
        );

        posterUrl = await uploadAndGetUrl(
            posterRef,
            posterBlob,
            "image/webp"
        );
    }

    progressFn(80);

    // Create model document.
    const modelDoc = await addDoc(collection(db, "models"), {
        name,
        description,
        categoryIds,
        tags,

        uploaderId,
        uploaderUsername,
        uploaderDisplayName,

        originalFileUrl,
        convertedFileUrl,
        renderPrimaryUrl,
        renderExtraUrls,
        posterUrl,

        price: Number.isFinite(price) ? price : 0,
        isPaid,
        isAI,
        currency: "usd",

        views: 0,
        likes: 0,
        purchaseCount: 0,
        totalRevenue: 0,

        createdAt: serverTimestamp(),
    });

    // Link model to the uploader and update upload statistics.
    if (uploaderId) {
        const userRef = doc(db, "users", uploaderId);

        try {
            await runTransaction(db, async (transaction) => {
                const userDoc = await transaction.get(userRef);

                if (!userDoc.exists()) {
                    transaction.set(userRef, {
                        uploads: [modelDoc.id],
                        isArtist: true,
                        stats: {
                            uploadsCount: 1,
                            likesCount: 0,
                            viewsCount: 0,
                            followers: 0,
                            following: 0,
                            loginCount: 0,
                        },
                    });

                    return;
                }

                const userData = userDoc.data();
                const currentUploads = userData.uploads ?? [];
                const currentStats = userData.stats ?? {};

                transaction.update(userRef, {
                    uploads: [...currentUploads, modelDoc.id],
                    isArtist: true,
                    "stats.uploadsCount":
                        (currentStats.uploadsCount ?? 0) + 1,
                });
            });
        } catch (error) {
            console.warn(
                "Model uploaded, but user stats update failed:",
                error
            );
        }
    }

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

export async function updateModel(
    modelId: string,
    updates: ModelUpdateData
): Promise<void> {
    const modelRef = doc(db, "models", modelId);

    await updateDoc(modelRef, {
        ...updates,
        updatedAt: serverTimestamp(),
    });
}

export async function deleteModel(
    modelId: string
): Promise<void> {
    const deleteModelFunction = httpsCallable<
        { modelId: string },
        unknown
    >(functions, "deleteModel");

    await deleteModelFunction({ modelId });
}