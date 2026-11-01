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

const CACHE_CONTROL = "public,max-age=31536000,immutable";

function uploadFile(
    fileRef: StorageReference,
    data: Blob,
    contentType: string,
    onProgress?: (snapshot: UploadTaskSnapshot) => void
): Promise<void> {
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
            () => resolve()
        );
    });
}

async function uploadAndGetUrl(
    fileRef: StorageReference,
    data: Blob,
    contentType: string,
    onProgress?: (snapshot: UploadTaskSnapshot) => void
): Promise<string> {
    await uploadFile(fileRef, data, contentType, onProgress);
    return getDownloadURL(fileRef);
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
    price?: number;
    isPaid?: boolean;
    isAI?: boolean;
}

export interface CreateModelResult {
    modelId: string;
    originalFilePath: string;
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
    price = 0,
    isPaid = false,
    isAI = false,
}: CreateModelParams): Promise<CreateModelResult> {
    const progressFn = onProgress ?? (() => undefined);

    // Unique folder prevents files with the same name from overwriting each other.
    const uploadKey = `${uploaderId}/${crypto.randomUUID()}`;

    progressFn(0);

    // Upload the original model file to the private folder. It gets no public
    // URL; downloads go through getModelDownloadUrl.
    const originalFilePath = `${STORAGE_PATHS.PRIVATE_ORIGINALS}/${uploadKey}/${file.name}`;
    const originalRef = ref(storage, originalFilePath);

    await uploadFile(
        originalRef,
        file,
        file.type,
        (snapshot) => {
            const progress =
                (snapshot.bytesTransferred / snapshot.totalBytes) * 20;

            progressFn(progress);
        }
    );

    // Public 3D preview: a reduced copy (see lightPreview.ts), never the
    // printable original. Formats the viewer can't show get images only.
    let convertedFileUrl = "";
    let previewTriangles: number | null = null;
    let sourceTriangles: number | null = null;

    // Loaded here so the mesh tools only download when someone uploads.
    const [{ fileToTriangles }, { makeLightPreview }] = await Promise.all([
        import("@/features/models/utils/converter"),
        import("@/features/models/utils/lightPreview"),
    ]);
    const triangles = await fileToTriangles(file);
    if (triangles) {
        const preview = await makeLightPreview(triangles);
        previewTriangles = preview.triangles;
        sourceTriangles = preview.sourceTriangles;

        const baseName = file.name.replace(/\.[^.]+$/, "");
        const previewRef = ref(
            storage,
            `${STORAGE_PATHS.CONVERTED}/${uploadKey}/${baseName}-preview.glb`
        );

        convertedFileUrl = await uploadAndGetUrl(
            previewRef,
            new Blob([preview.glb], { type: "model/gltf-binary" }),
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

        originalFilePath,
        originalFileName: file.name,
        originalFileSize: file.size,
        convertedFileUrl,
        previewTriangles,
        sourceTriangles,
        previewVersion: triangles ? 1 : null,
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
        originalFilePath,
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
/** Short-lived link to the original file, for the uploader, buyers and free models. */
export async function getModelDownloadUrl(
    modelId: string
): Promise<{ url: string; fileName: string }> {
    const getDownloadUrl = httpsCallable<
        { modelId: string },
        { url: string; fileName: string }
    >(functions, "getModelDownloadUrl");

    const result = await getDownloadUrl({ modelId });
    return result.data;
}
