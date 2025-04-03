import { db, storage } from "../firebase/firebaseConfig";
import {
    collection,
    addDoc,
    serverTimestamp,
    doc,
    updateDoc,
    arrayUnion,
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { finalConvertFileToGLB } from "../utils/models/converter";

// add model in DB
export async function createAdvancedModel({
    name,
    description,
    category,
    tags,
    file,
    renderFiles,
    selectedRenderIndex,
    uploaderId,
    uploaderDisplayName = "Anonymous", // Default value if not provided
    onProgress,
}) {
    if (!file) throw new Error("No model file provided");
    const progressFn = onProgress || (() => {});
    let progress = 0;
    progressFn(progress);

    // Upload original model file (0 -> 50%)
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

    // Convert to .glb if needed (50 -> 100%)
    let convertedFileUrl = null;
    const lower = file.name.toLowerCase();
    if (lower.endsWith(".stl") || lower.endsWith(".obj")) {
        const { blob } = await finalConvertFileToGLB(file);
        const baseName = file.name.replace(/\.[^/.]+$/, "");
        const convertedRef = ref(storage, `models/converted/${baseName}.glb`);
        const convertedTask = uploadBytesResumable(convertedRef, blob);
        convertedFileUrl = await new Promise((resolve, reject) => {
            convertedTask.on(
                "state_changed",
                (snapshot) => {
                    const ratio =
                        snapshot.bytesTransferred / snapshot.totalBytes;
                    const offset = 50 + ratio * 50;
                    progressFn(offset);
                },
                reject,
                async () => {
                    const url = await getDownloadURL(
                        convertedTask.snapshot.ref
                    );
                    resolve(url);
                }
            );
        });
    } else {
        convertedFileUrl = originalFileUrl;
        progressFn(100);
    }

    // Upload render files in Storage
    let renderFileUrls = [];
    if (renderFiles && renderFiles.length > 0) {
        for (const file of renderFiles) {
            const renderRef = ref(storage, `models/render/${file.name}`);
            const renderTask = uploadBytesResumable(renderRef, file);
            const url = await new Promise((resolve, reject) => {
                renderTask.on(
                    "state_changed",
                    () => {},
                    reject,
                    async () => {
                        const url = await getDownloadURL(
                            renderTask.snapshot.ref
                        );
                        resolve(url);
                    }
                );
            });
            renderFileUrls.push(url);
        }
    }

    // Save model doc in Firestore
    const modelDocRef = await addDoc(collection(db, "models"), {
        name,
        description,
        category,
        tags,
        uploaderId,
        uploaderDisplayName, // Now passed as a prop or defaults to "Anonymous"
        originalFileUrl,
        convertedFileUrl: convertedFileUrl || originalFileUrl,
        renderFileUrls: renderFileUrls.length > 0 ? renderFileUrls : null,
        primaryRenderUrl: renderFileUrls[selectedRenderIndex] || null,
        createdAt: serverTimestamp(),
    });

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
    };
}
