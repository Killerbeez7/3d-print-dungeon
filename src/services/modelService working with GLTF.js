// src/services/modelService.js
import { db, storage } from "../firebase/firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

// Unified final conversion for stl/obj
import { finalConvertFileToGltf } from "../utils/converter";

export async function createAdvancedModel({
    name,
    description,
    tags,
    file,
    userId,
    onProgress,
}) {
    if (!file) throw new Error("No file provided");
    const progressFn = onProgress || (() => {});
    let progress = 0;
    progressFn(progress);

    // 1) Upload original file (progress 0 -> 50%)
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

    // 2) Convert to .gltf if .stl or .obj (progress 50 -> 100%)
    let convertedFileUrl = null;
    const lower = file.name.toLowerCase();

    if (lower.endsWith(".stl") || lower.endsWith(".obj")) {
        const { blob } = await finalConvertFileToGltf(file);
        const baseName = file.name.replace(/\.[^/.]+$/, "");
        const convertedRef = ref(storage, `models/converted/${baseName}.gltf`);
        const convertedTask = uploadBytesResumable(convertedRef, blob);

        convertedFileUrl = await new Promise((resolve, reject) => {
            convertedTask.on(
                "state_changed",
                (snapshot) => {
                    const ratio =
                        snapshot.bytesTransferred / snapshot.totalBytes;
                    // offset the progress from 50 -> 100
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
        // For other file types (e.g. .zip), just use the original
        convertedFileUrl = originalFileUrl;
        progressFn(100);
    }

    // 3) Add doc to Firestore
    const docData = {
        name,
        description,
        tags,
        userId,
        originalFileUrl,
        // If we have a .gltf, use that; otherwise fallback to original
        convertedFileUrl: convertedFileUrl || originalFileUrl,
        createdAt: serverTimestamp(),
    };

    await addDoc(collection(db, "models"), docData);
    progressFn(100);

    return {
        originalFileUrl,
        convertedFileUrl: convertedFileUrl || originalFileUrl,
    };
}
