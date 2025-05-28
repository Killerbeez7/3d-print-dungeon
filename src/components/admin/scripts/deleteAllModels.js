import { db, storage } from "../../../config/firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  arrayRemove,
  writeBatch,
  query,
  where,
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";

export async function deleteAllModelsAndRelated(onProgress) {
  // 1. Fetch all models
  const modelsSnap = await getDocs(collection(db, "models"));
  const models = modelsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const total = models.length;
  let done = 0;

  // 2. Fetch all users (for favorites/uploads cleanup)
  const usersSnap = await getDocs(collection(db, "users"));
  const users = usersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  for (const model of models) {
    const modelId = model.id;
    const fileNames = [];
    // Try to extract file names from URLs (if present)
    if (model.originalFileUrl) fileNames.push(model.originalFileUrl.split("/").pop().split("?")[0]);
    if (model.convertedFileUrl) fileNames.push(model.convertedFileUrl.split("/").pop().split("?")[0]);
    if (model.primaryRenderUrl) fileNames.push(model.primaryRenderUrl.split("/").pop().split("?")[0]);
    if (model.posterUrl) fileNames.push(model.posterUrl.split("/").pop().split("?")[0]);
    if (Array.isArray(model.renderExtraUrls)) {
      model.renderExtraUrls.forEach((url) => fileNames.push(url.split("/").pop().split("?")[0]));
    }

    // 3. Delete comments
    const commentsQ = query(collection(db, "comments"), where("modelId", "==", modelId));
    const commentsSnap = await getDocs(commentsQ);
    for (const c of commentsSnap.docs) {
      await deleteDoc(c.ref);
    }

    // 4. Delete likes
    const likesQ = query(collection(db, "likes"), where("modelId", "==", modelId));
    const likesSnap = await getDocs(likesQ);
    for (const l of likesSnap.docs) {
      await deleteDoc(l.ref);
    }

    // 5. Delete views (viewTrackers, userViews)
    const viewTrackersQ = query(collection(db, "viewTrackers"), where("modelId", "==", modelId));
    const viewTrackersSnap = await getDocs(viewTrackersQ);
    for (const v of viewTrackersSnap.docs) {
      await deleteDoc(v.ref);
    }
    const userViewsQ = query(collection(db, "userViews"), where("modelId", "==", modelId));
    const userViewsSnap = await getDocs(userViewsQ);
    for (const v of userViewsSnap.docs) {
      await deleteDoc(v.ref);
    }

    // 6. Remove from all users' favorites and uploads
    for (const user of users) {
      const batch = writeBatch(db);
      if (Array.isArray(user.favorites) && user.favorites.includes(modelId)) {
        batch.update(doc(db, "users", user.id), { favorites: arrayRemove(modelId) });
      }
      if (Array.isArray(user.uploads) && user.uploads.includes(modelId)) {
        batch.update(doc(db, "users", user.id), { uploads: arrayRemove(modelId) });
      }
      await batch.commit();
    }

    // 7. Delete files from storage (try common paths)
    const storagePaths = [
      `models/original/${fileNames[0]}`,
      `models/converted/${fileNames[1]}`,
      `models/renderPrimary/${fileNames[2]}`,
      `models/posters/${fileNames[3]}`,
    ];
    if (Array.isArray(model.renderExtraUrls)) {
      model.renderExtraUrls.forEach((url, i) => {
        storagePaths.push(`models/renderExtras/${fileNames[4 + i]}`);
      });
    }
    for (const path of storagePaths) {
      if (path && typeof path === "string") {
        try {
          await deleteObject(ref(storage, path));
        } catch {
          // Ignore if file doesn't exist
        }
      }
    }

    // 8. Delete the model document
    await deleteDoc(doc(db, "models", modelId));
    done++;
    if (onProgress) onProgress(Math.round((done / total) * 100));
    console.log(`Deleted model ${modelId} and all related data.`);
  }
  if (onProgress) onProgress(100);
  console.log("All models and related data deleted.");
}

// Optionally, call the function directly for testing
// deleteAllModelsAndRelated(); 