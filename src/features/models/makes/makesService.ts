import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  where,
  type Timestamp,
} from "firebase/firestore";

import { db } from "@/config/firebaseConfig";
import { loadStorage } from "@/config/firebaseLazy";

/** A photo someone posted of their print of a model. */
export interface Make {
  id: string;
  modelId: string;
  userId: string;
  userName: string;
  username: string | null;
  imageUrl: string;
  imagePath: string;
  caption: string;
  createdAt: Timestamp | null;
}

export const MAX_CAPTION = 280;
const MAX_SIDE = 1600;
const MAX_FILE_BYTES = 15 * 1024 * 1024;

/** The newest makes of a model (up to 60). Empty while the makes rules aren't deployed. */
export async function listMakes(modelId: string): Promise<Make[]> {
  try {
    const snap = await getDocs(
      query(collection(db, "makes"), where("modelId", "==", modelId), limit(60)),
    );
    return snap.docs
      .map((d) => ({ id: d.id, ...(d.data() as Omit<Make, "id">) }))
      .sort(
        (a, b) => (b.createdAt?.toMillis() ?? Date.now()) - (a.createdAt?.toMillis() ?? Date.now()),
      );
  } catch (error) {
    if ((error as { code?: string }).code === "permission-denied") return [];
    throw error;
  }
}

/** Scales a photo down to at most 1600 px on its longest side, as WebP (JPEG where unsupported). */
async function shrink(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const toBlob = (type: string) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.85));
  const blob = (await toBlob("image/webp")) ?? (await toBlob("image/jpeg"));
  if (!blob) throw new Error("This photo couldn't be read. Try a JPEG or PNG.");
  return blob;
}

interface NewMake {
  modelId: string;
  file: File;
  caption: string;
  user: { uid: string; displayName: string; username: string | null };
}

/** Uploads the photo to the poster's own folder, then records the make. */
export async function postMake({ modelId, file, caption, user }: NewMake): Promise<void> {
  if (!file.type.startsWith("image/")) throw new Error("Choose a photo (JPEG, PNG or WebP).");
  if (file.size > MAX_FILE_BYTES)
    throw new Error("That photo is over 15 MB. Choose a smaller one.");

  const blob = await shrink(file);
  const { ref, storage, uploadBytes, getDownloadURL } = await loadStorage();
  const imagePath = `users/${user.uid}/makes/${crypto.randomUUID()}.${blob.type === "image/webp" ? "webp" : "jpg"}`;
  const stored = await uploadBytes(ref(storage, imagePath), blob, {
    contentType: blob.type,
    cacheControl: "public,max-age=31536000,immutable",
  });
  const imageUrl = await getDownloadURL(stored.ref);

  await addDoc(collection(db, "makes"), {
    modelId,
    userId: user.uid,
    userName: user.displayName.slice(0, 80),
    username: user.username,
    imageUrl,
    imagePath,
    caption: caption.trim().slice(0, MAX_CAPTION),
    createdAt: serverTimestamp(),
  });
}

/** Removes a make and its photo. */
export async function deleteMake(make: Make): Promise<void> {
  await deleteDoc(doc(db, "makes", make.id));
  try {
    const { ref, storage, deleteObject } = await loadStorage();
    await deleteObject(ref(storage, make.imagePath));
  } catch {
    // The photo belongs to the poster's folder; if it can't be removed here it stays unused.
  }
}
