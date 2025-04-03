import { db, storage } from "../../firebase/firebaseConfig";
import {
    collection,
    query,
    orderBy,
    getDocs,
    doc,
    deleteDoc,
    updateDoc,
    arrayRemove,
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";

export async function deleteAllButFirstModel() {
    const modelsRef = collection(db, "models");
    const q = query(modelsRef, orderBy("createdAt", "asc"));
    const snapshot = await getDocs(q);
    const allModels = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
    }));

    if (allModels.length <= 1) {
        console.log("There are 0 or 1 models, nothing to delete.");
        return;
    }

    // Keep the first model, delete the rest
    const [firstModel, ...modelsToDelete] = allModels;
    console.log(
        "Keeping first model:",
        firstModel.id,
        firstModel.name || "Unnamed"
    );
    console.log(
        "Deleting these models:",
        modelsToDelete.map((m) => m.id)
    );

    for (const model of modelsToDelete) {
        await deleteModelAndFiles(model);

        if (model.uploaderId) {
            await removeModelFromUserUploads(model.uploaderId, model.id);
        }
    }

    console.log("All but the first model have been deleted.");
}

async function deleteModelAndFiles(model) {
    const {
        id: modelId,
        originalFileUrl,
        convertedFileUrl,
        renderFileUrls = [],
        renderLowResUrls = [],
    } = model;

    // Delete original file
    if (originalFileUrl) {
        await deleteFileByUrl(originalFileUrl);
    }

    // Delete converted file
    if (convertedFileUrl && convertedFileUrl !== originalFileUrl) {
        await deleteFileByUrl(convertedFileUrl);
    }

    // Delete render files
    if (renderFileUrls != null) {
        for (const fileUrl of renderFileUrls) {
            await deleteFileByUrl(fileUrl);
        }
    }
    
    // Delete low-res files
    for (const lowResUrl of renderLowResUrls) {
        await deleteFileByUrl(lowResUrl);
    }

    // Demove the Firestore doc
    await deleteDoc(doc(db, "models", modelId));
    console.log(`Deleted model doc ${modelId}`);
}

async function removeModelFromUserUploads(uploaderId, modelId) {
    try {
        const userRef = doc(db, "users", uploaderId);
        await updateDoc(userRef, {
            uploads: arrayRemove(modelId),
        });
        console.log(
            `Removed model ${modelId} from user ${uploaderId} uploads array.`
        );
    } catch (err) {
        console.warn("Error removing model from user uploads array:", err);
    }
}

async function deleteFileByUrl(fileUrl) {
    if (!fileUrl) return;
    try {
        const decodedUrl = decodeURIComponent(fileUrl.split("?")[0]);
        const baseIndex = decodedUrl.indexOf("/o/") + 3;
        const storagePath = decodedUrl.slice(baseIndex);

        const fileRef = ref(storage, storagePath);
        await deleteObject(fileRef);
        console.log(`Deleted file from Storage: ${storagePath}`);
    } catch (err) {
        console.warn(`Failed to delete file: ${fileUrl}`, err);
    }
}
