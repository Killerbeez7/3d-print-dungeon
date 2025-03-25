import { db, storage } from "../firebase/firebaseConfig";
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

/**
 * deleteAllButFirstModel()
 * - Keeps the first (earliest createdAt) model document
 * - Deletes all other model docs
 * - Removes associated files from Storage
 * - Optionally removes references from user docs if you want to keep user "uploads" arrays clean
 */
export async function deleteAllButFirstModel() {
    // 1) Query all models in ascending order
    const modelsRef = collection(db, "models");
    const q = query(modelsRef, orderBy("createdAt", "asc"));
    const snapshot = await getDocs(q);
    const allModels = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
    }));

    // If there's 0 or 1 model, do nothing
    if (allModels.length <= 1) {
        console.log("There are 0 or 1 models, nothing to delete.");
        return;
    }

    // Keep the first model, delete the rest
    const [firstModel, ...modelsToDelete] = allModels;
    console.log("Keeping first model:", firstModel.id, firstModel.name || "Unnamed");
    console.log(
        "Deleting these models:",
        modelsToDelete.map((m) => m.id)
    );

    // 2) Delete each subsequent model
    for (const model of modelsToDelete) {
        await deleteModelAndFiles(model);
        // Optionally remove references from the user doc
        // if your user doc has an 'uploads' array
        if (model.uploaderId) {
            await removeModelFromUserUploads(model.uploaderId, model.id);
        }
    }

    console.log("All but the first model have been deleted.");
}

/**
 * deleteModelAndFiles(model)
 * - Deletes associated files from Storage
 * - Then removes the Firestore doc
 */
async function deleteModelAndFiles(model) {
    const {
        id: modelId,
        originalFileUrl,
        convertedFileUrl,
        renderFileUrls = [],
        renderLowResUrls = [],
    } = model;

    // 1) Delete original file
    if (originalFileUrl) {
        await deleteFileByUrl(originalFileUrl);
    }

    // 2) Delete converted file if different
    if (convertedFileUrl && convertedFileUrl !== originalFileUrl) {
        await deleteFileByUrl(convertedFileUrl);
    }

    // 3) Delete each render file
    for (const fileUrl of renderFileUrls) {
        await deleteFileByUrl(fileUrl);
    }

    // 4) Delete each low-res render if you store them
    for (const lowResUrl of renderLowResUrls) {
        await deleteFileByUrl(lowResUrl);
    }

    // 5) Remove the Firestore doc
    await deleteDoc(doc(db, "models", modelId));
    console.log(`Deleted model doc ${modelId}`);
}

/**
 * removeModelFromUserUploads(uploaderId, modelId)
 * - If your user doc has an 'uploads' array, remove the model ID from it
 */
async function removeModelFromUserUploads(uploaderId, modelId) {
    try {
        const userRef = doc(db, "users", uploaderId);
        await updateDoc(userRef, {
            uploads: arrayRemove(modelId),
        });
        console.log(`Removed model ${modelId} from user ${uploaderId} uploads array.`);
    } catch (err) {
        console.warn("Error removing model from user uploads array:", err);
    }
}

/**
 * deleteFileByUrl(fileUrl)
 * - Extracts the storage path from a standard Firebase Storage URL
 * - Deletes the corresponding file from Storage
 */
async function deleteFileByUrl(fileUrl) {
    if (!fileUrl) return;
    try {
        // Attempt to parse the path from the Storage URL
        const decodedUrl = decodeURIComponent(fileUrl.split("?")[0]);
        const baseIndex = decodedUrl.indexOf("/o/") + 3; // "/o/" is 3 chars
        const storagePath = decodedUrl.slice(baseIndex);

        const fileRef = ref(storage, storagePath);
        await deleteObject(fileRef);
        console.log(`Deleted file from Storage: ${storagePath}`);
    } catch (err) {
        console.warn(`Failed to delete file: ${fileUrl}`, err);
    }
}
