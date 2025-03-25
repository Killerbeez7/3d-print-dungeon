import { db, storage } from "../firebase/firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { finalConvertFileToGLB, localConvertToGLBForPreview } from "../utils/converter";

export async function createAdvancedModel({
    name,
    description,
    tags,
    file,
    renderFiles, // now an array of render files
    selectedRenderIndex, // index of the primary render image
    uploaderId,
    onProgress,
}) {
    if (!file) throw new Error("No model file provided");
    const progressFn = onProgress || (() => {});
    let progress = 0;
    progressFn(progress);

    // 1) Upload original model file (0 -> 50%)
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

    // 2) Convert to .glb if needed (50 -> 100%)
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

    // 3) If render files are provided, upload each one
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

    // 4) Save document in Firestore with both an array and a primary render field
    const docData = {
        name,
        description,
        tags,
        uploaderId,
        originalFileUrl,
        convertedFileUrl: convertedFileUrl || originalFileUrl,
        renderFileUrls: renderFileUrls.length > 0 ? renderFileUrls : null,
        primaryRenderUrl: renderFileUrls[selectedRenderIndex] || null,
        createdAt: serverTimestamp(),
    };

    await addDoc(collection(db, "models"), docData);
    progressFn(100);
    return {
        originalFileUrl,
        convertedFileUrl: convertedFileUrl || originalFileUrl,
        renderFileUrls,
        primaryRenderUrl: renderFileUrls[selectedRenderIndex] || null,
    };
}

// Extracted file handling logic
export function handleFileChange(e, setModelData) {
    const file = e.target.files?.[0];
    if (file) {
        const lower = file.name.toLowerCase();
        setModelData((prev) => ({
            ...prev,
            file,
            localPreviewUrl: URL.createObjectURL(file),
            convertedUrl: lower.endsWith(".gltf") || lower.endsWith(".glb") ? URL.createObjectURL(file) : null,
        }));
    }
}

// Handle render image files
export function handleRenderFilesChange(e, setModelData) {
    const files = Array.from(e.target.files);
    const previewUrls = files.map((f) => URL.createObjectURL(f));
    setModelData((prev) => ({
        ...prev,
        renderFiles: files,
        renderPreviewUrls: previewUrls,
        selectedRenderIndex: 0, // default to first
    }));
}

// Handle converting preview (stl/obj to glb)
export async function handleConvertPreview(file, setModelData, setIsConverting, setError) {
    if (!file) {
        setError("No file selected.");
        return;
    }
    const lower = file.name.toLowerCase();
    if (lower.endsWith(".gltf") || lower.endsWith(".glb")) {
        setError("GLTF/GLB files don't require conversion.");
        return;
    }
    if (!lower.endsWith(".stl") && !lower.endsWith(".obj")) {
        setError("Only .stl/.obj supported for local preview conversion.");
        return;
    }
    setIsConverting(true);
    setError("");
    try {
        const { blobUrl } = await localConvertToGLBForPreview(file);
        setModelData((prev) => ({ ...prev, convertedUrl: blobUrl }));
    } catch (err) {
        console.error("Convert error:", err);
        setError("Conversion failed. Check console for details.");
    } finally {
        setIsConverting(false);
    }
}
