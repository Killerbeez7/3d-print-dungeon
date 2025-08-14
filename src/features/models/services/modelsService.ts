import { db, storage } from "../../../config/firebaseConfig";
import {
    collection,
    addDoc,
    serverTimestamp,
    doc,
    updateDoc,
    runTransaction,
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { finalConvertFileToGLB } from "../utils/converter";
import { STORAGE_PATHS } from '../../../constants/storagePaths';
import { httpsCallable } from "firebase/functions";
import { functions } from "../../../config/firebaseConfig";
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

// Create a new 3D model and upload all related files.
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
        uploaderUsername,
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

    // link to user and increment upload count
    if (uploaderId) {
        const userRef = doc(db, "users", uploaderId);
        try {
            // Use a transaction to ensure atomic updates
            await runTransaction(db, async (transaction) => {
                const userDoc = await transaction.get(userRef);
                
                if (!userDoc.exists()) {
                    // Create new user document with proper stats structure
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
                } else {
                    // Update existing user document
                    const currentData = userDoc.data();
                    const currentUploads = currentData.uploads || [];
                    const currentStats = currentData.stats || {};
                    
                    transaction.update(userRef, {
                        uploads: [...currentUploads, modelDoc.id],
                        isArtist: true,
                        "stats.uploadsCount": (currentStats.uploadsCount || 0) + 1,
                    });
                }
            });
        } catch (err) {
            console.warn("User stats update failed:", err);
        }
    }

    // Create or update artist profile when user becomes an artist
    // const artistRef = doc(db, "artists", uploaderId);
    // await setDoc(artistRef, {
    //     username: uploaderUsername,
    //     displayName: uploaderDisplayName,
    //     isArtist: true,
    //     updatedAt: serverTimestamp(),
    // }, { merge: true });

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


// Update model information
export async function updateModel(
    modelId: string, 
    updates: Partial<Pick<ModelData, 'name' | 'description' | 'tags' | 'categoryIds' | 'price' | 'isPaid'>>
): Promise<void> {
    try {
        const modelRef = doc(db, "models", modelId);
        await updateDoc(modelRef, {
            ...updates,
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error("Error updating model:", error);
        throw error;
    }
}

// Delete model using Cloud Function
export const deleteModel = async (modelId: string): Promise<void> => {
    const deleteModelFunction = httpsCallable(functions, 'deleteModel');
    
    try {
        const result = await deleteModelFunction({ modelId });
        console.log('Model deleted successfully:', result);
    } catch (error) {
        console.error('Error deleting model:', error);
        throw error;
    }
};