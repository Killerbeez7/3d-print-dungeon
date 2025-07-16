import { db, storage } from "../../../config/firebaseConfig";
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
import { STORAGE_PATHS } from '../../../constants/storagePaths';
import type { AdminModel, AdminUser } from "@/features/admin/types/admin";


export async function deleteAllModelsAndRelated(onProgress?: (progress: number) => void): Promise<void> {
  const modelsSnap = await getDocs(collection(db, "models"));
  const models = modelsSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as AdminModel[];
  const total = models.length;
  let done = 0;
  const usersSnap = await getDocs(collection(db, "users"));
  const users = usersSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as AdminUser[];
  for (const model of models) {
    const modelId = model.id as string;
    const fileNames: string[] = [];
    if (model.originalFileUrl) fileNames.push(model.originalFileUrl.split("/").pop()?.split("?")[0] ?? "");
    if (model.convertedFileUrl) fileNames.push(model.convertedFileUrl.split("/").pop()?.split("?")[0] ?? "");
    if (model.renderPrimaryUrl) fileNames.push(model.renderPrimaryUrl.split("/").pop()?.split("?")[0] ?? "");
    if (model.posterUrl) fileNames.push(model.posterUrl.split("/").pop()?.split("?")[0] ?? "");
    if (Array.isArray(model.renderExtraUrls)) {
      model.renderExtraUrls.forEach((url: string) => fileNames.push(url.split("/").pop()?.split("?")[0] ?? ""));
    }
    // Delete comments
    const commentsQ = query(collection(db, "comments"), where("modelId", "==", modelId));
    const commentsSnap = await getDocs(commentsQ);
    for (const c of commentsSnap.docs) {
      await deleteDoc(c.ref);
    }
    // Delete likes
    const likesQ = query(collection(db, "likes"), where("modelId", "==", modelId));
    const likesSnap = await getDocs(likesQ);
    for (const l of likesSnap.docs) {
      await deleteDoc(l.ref);
    }
    // Delete views
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
    // Remove from all users' favorites and uploads
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
    // Delete files from storage
    const storagePaths: string[] = [
      `${STORAGE_PATHS.ORIGINAL}/${fileNames[0]}`,
      `${STORAGE_PATHS.CONVERTED}/${fileNames[1]}`,
      `${STORAGE_PATHS.RENDER_PRIMARY}/${fileNames[2]}`,
      `${STORAGE_PATHS.POSTERS}/${fileNames[3]}`,
    ];
    if (Array.isArray(model.renderExtraUrls)) {
      model.renderExtraUrls.forEach((url: string, i: number) => {
        storagePaths.push(`${STORAGE_PATHS.RENDER_EXTRAS}/${fileNames[4 + i]}`);
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
    await deleteDoc(doc(db, "models", modelId));
    done++;
    if (onProgress) onProgress(Math.round((done / total) * 100));
    console.log(`Deleted model ${modelId} and all related data.`);
  }
  if (onProgress) onProgress(100);
  console.log("All models and related data deleted.");
}


export async function deleteModelAndRelated(modelId: string): Promise<void> {
  const modelDoc = await getDocs(query(collection(db, "models"), where("__name__", "==", modelId)));
  if (modelDoc.empty) throw new Error("Model not found");
  const model = { id: modelId, ...modelDoc.docs[0].data() } as AdminModel;
  const usersSnap = await getDocs(collection(db, "users"));
  const users = usersSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as AdminUser[];
  // Delete comments
  const commentsQ = query(collection(db, "comments"), where("modelId", "==", modelId));
  const commentsSnap = await getDocs(commentsQ);
  for (const c of commentsSnap.docs) {
    await deleteDoc(c.ref);
  }
  // Delete likes
  const likesQ = query(collection(db, "likes"), where("modelId", "==", modelId));
  const likesSnap = await getDocs(likesQ);
  for (const l of likesSnap.docs) {
    await deleteDoc(l.ref);
  }
  // Delete views
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
  // Remove from all users' favorites and uploads
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
  // Delete files from storage
  const fileNames: string[] = [];
  if (model.originalFileUrl) fileNames.push(model.originalFileUrl.split("/").pop()?.split("?")[0] ?? "");
  if (model.convertedFileUrl) fileNames.push(model.convertedFileUrl.split("/").pop()?.split("?")[0] ?? "");
  if (model.renderPrimaryUrl) fileNames.push(model.renderPrimaryUrl.split("/").pop()?.split("?")[0] ?? "");
  if (model.posterUrl) fileNames.push(model.posterUrl.split("/").pop()?.split("?")[0] ?? "");
  if (Array.isArray(model.renderExtraUrls)) {
    model.renderExtraUrls.forEach((url: string) => fileNames.push(url.split("/").pop()?.split("?")[0] ?? ""));
  }
  const storagePaths: string[] = [
    `${STORAGE_PATHS.ORIGINAL}/${fileNames[0]}`,
    `${STORAGE_PATHS.CONVERTED}/${fileNames[1]}`,
    `${STORAGE_PATHS.RENDER_PRIMARY}/${fileNames[2]}`,
    `${STORAGE_PATHS.POSTERS}/${fileNames[3]}`,
  ];
  if (Array.isArray(model.renderExtraUrls)) {
    model.renderExtraUrls.forEach((url: string, i: number) => {
      storagePaths.push(`${STORAGE_PATHS.RENDER_EXTRAS}/${fileNames[4 + i]}`);
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
  await deleteDoc(doc(db, "models", modelId));
  console.log(`Deleted model ${modelId} and all related data.`);
} 