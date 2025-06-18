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
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { finalConvertFileToGLB } from "../utils/models/converter";
import { STORAGE_PATHS } from '../constants/storagePaths';

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
}) {
    const progressFn = onProgress || (() => {});
    let progress = 0;
    progressFn(progress);

    // original 3D file
    const origRef = ref(storage, `${STORAGE_PATHS.ORIGINAL}/${file.name}`);
    const origTask = uploadBytesResumable(origRef, file);
    const originalFileUrl = await new Promise((res, rej) => {
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
    let convertedFileUrl = originalFileUrl;
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
    let renderPrimaryUrl = null;
    let renderExtraUrls = [];

    if (renderFiles?.length) {
        // primary
        const primary = renderFiles[selectedRenderIndex];
        if (primary) {
            const pRef = ref(storage, `${STORAGE_PATHS.RENDER_PRIMARY}/${primary.name}`);
            const pTask = uploadBytesResumable(pRef, primary);
            renderPrimaryUrl = await new Promise((res, rej) => {
                pTask.on(
                    "state_changed",
                    () => {},
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
                    return await new Promise((res, rej) => {
                        xTask.on(
                            "state_changed",
                            () => {},
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
    let posterUrl = null;
    if (posterBlob) {
        const postRef = ref(storage, `${STORAGE_PATHS.POSTERS}/${file.name}.webp`);
        const postTask = uploadBytesResumable(postRef, posterBlob);
        posterUrl = await new Promise((res, rej) => {
            postTask.on(
                "state_changed",
                () => {},
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
        price: parseFloat(price) || 0,
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

// function to increment view count

export const incrementModelViews = async (modelId) => {
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

// pagination
export const PAGE_SIZE = 30;

export async function fetchModels(pageParam) {
    const base = query(collection(db, "models"), orderBy("createdAt", "desc"));

    const q = pageParam
        ? query(base, startAfter(pageParam), limit(PAGE_SIZE))
        : query(base, limit(PAGE_SIZE));

    const snap = await getDocs(q);

    return {
        models: snap.docs.map((d) => ({ id: d.id, ...d.data() })),

        nextCursor:
            snap.docs.length === PAGE_SIZE ? snap.docs[snap.docs.length - 1] : undefined,
    };
}
