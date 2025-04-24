import { db, storage } from "../config/firebase";
import {
    collection,
    addDoc,
    serverTimestamp,
    doc,
    updateDoc,
    arrayUnion,
    increment,
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { finalConvertFileToGLB } from "../utils/models/converter";

/**
 * createAdvancedModel
 * - Now accepts an optional preConvertedFile so that if the file was already converted,
 *   we avoid doing it again.
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
    posterBlob, // new param for your poster
    preConvertedFile, // new parameter to avoid reconversion
}) {
    if (!file) throw new Error("No model file provided");
    const progressFn = onProgress || (() => {});
    let progress = 0;
    progressFn(progress);

    // ============= 1) Upload original 3D file =============
    const originalRef = ref(storage, `models/original/${file.name}`);
    const originalTask = uploadBytesResumable(originalRef, file);
    const originalFileUrl = await new Promise((resolve, reject) => {
        originalTask.on(
            "state_changed",
            (snapshot) => {
                const ratio = snapshot.bytesTransferred / snapshot.totalBytes;
                progress = ratio * 50;
                progressFn(progress);
            },
            reject,
            async () => {
                const url = await getDownloadURL(originalTask.snapshot.ref);
                resolve(url);
            }
        );
    });

    // ============= 2) Convert if needed (e.g. .stl or .obj) =============
    let convertedFileUrl = null;
    const lower = file.name.toLowerCase();
    if ((lower.endsWith(".stl") || lower.endsWith(".obj")) && preConvertedFile) {
        const baseName = file.name.replace(/\.[^/.]+$/, "");
        const convertedRef = ref(storage, `models/converted/${baseName}.glb`);
        const convertedTask = uploadBytesResumable(convertedRef, preConvertedFile);
        convertedFileUrl = await new Promise((resolve, reject) => {
            convertedTask.on(
                "state_changed",
                (snapshot) => {
                    const ratio = snapshot.bytesTransferred / snapshot.totalBytes;
                    const offset = 50 + ratio * 50;
                    progressFn(offset);
                },
                reject,
                async () => {
                    const url = await getDownloadURL(convertedTask.snapshot.ref);
                    resolve(url);
                }
            );
        });
    } else if (lower.endsWith(".stl") || lower.endsWith(".obj")) {
        const { blob } = await finalConvertFileToGLB(file);
        const baseName = file.name.replace(/\.[^/.]+$/, "");
        const convertedRef = ref(storage, `models/converted/${baseName}.glb`);
        const convertedTask = uploadBytesResumable(convertedRef, blob);
        convertedFileUrl = await new Promise((resolve, reject) => {
            convertedTask.on(
                "state_changed",
                (snapshot) => {
                    const ratio = snapshot.bytesTransferred / snapshot.totalBytes;
                    const offset = 50 + ratio * 50;
                    progressFn(offset);
                },
                reject,
                async () => {
                    const url = await getDownloadURL(convertedTask.snapshot.ref);
                    resolve(url);
                }
            );
        });
    } else {
        convertedFileUrl = originalFileUrl;
        progressFn(100);
    }

    // ============= 3) Upload any render files =============
    let renderFileUrls = [];
    if (renderFiles && renderFiles.length > 0) {
        for (const render of renderFiles) {
            const renderRef = ref(storage, `models/render/${render.name}`);
            const renderTask = uploadBytesResumable(renderRef, render);
            const url = await new Promise((resolve, reject) => {
                renderTask.on(
                    "state_changed",
                    () => {},
                    reject,
                    async () => {
                        const downloadUrl = await getDownloadURL(renderTask.snapshot.ref);
                        resolve(downloadUrl);
                    }
                );
            });
            renderFileUrls.push(url);
        }
    }

    // ============= 4) Upload the posterBlob (if present) =============
    let posterUrl = null;
    if (posterBlob) {
        const posterRef = ref(storage, `models/posters/${file.name}.webp`);
        const posterTask = uploadBytesResumable(posterRef, posterBlob);
        posterUrl = await new Promise((resolve, reject) => {
            posterTask.on(
                "state_changed",
                () => {},
                reject,
                async () => {
                    const downloadUrl = await getDownloadURL(posterTask.snapshot.ref);
                    resolve(downloadUrl);
                }
            );
        });
    }

    // ============= 5) Create Firestore doc =============
    const modelDocRef = await addDoc(collection(db, "models"), {
        name,
        description,
        category,
        tags,
        uploaderId,
        uploaderDisplayName,
        originalFileUrl,
        convertedFileUrl: convertedFileUrl || originalFileUrl,
        renderFileUrls: renderFileUrls.length > 0 ? renderFileUrls : null,
        primaryRenderUrl: renderFileUrls[selectedRenderIndex] || null,
        posterUrl: posterUrl || null,
        createdAt: serverTimestamp(),
        views: 0,
        likes: 0
    });

    // ============= 6) Update user doc =============
    const userRef = doc(db, "users", uploaderId);
    await updateDoc(userRef, {
        uploads: arrayUnion(modelDocRef.id),
        artist: true,
    });

    progressFn(100);

    return {
        modelId: modelDocRef.id,
        originalFileUrl,
        convertedFileUrl: convertedFileUrl || originalFileUrl,
        renderFileUrls,
        primaryRenderUrl: renderFileUrls[selectedRenderIndex] || null,
        posterUrl,
    };
}

// Function to increment view count
export const incrementModelViews = async (modelId) => {
    try {
        const modelRef = doc(db, "models", modelId);
        await updateDoc(modelRef, {
            views: increment(1),
            lastViewed: serverTimestamp()
        });
    } catch (error) {
        console.error("Error incrementing views:", error);
    }
};
