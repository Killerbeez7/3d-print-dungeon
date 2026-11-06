import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/config/firebaseConfig";

/** Dev log posts shown on the coming-soon page. Anyone can read them; only admins write. */
export interface DevlogPost {
  id: string;
  title: string;
  body: string;
  createdAt: Date | null;
}

export const DEVLOG_QUERY_KEY = ["devlog"] as const;
export const DEVLOG_TITLE_MAX = 120;
export const DEVLOG_BODY_MAX = 5000;
const DEVLOG_PAGE = 30;

const devlog = collection(db, "devlog");

export async function fetchDevlogPosts(): Promise<DevlogPost[]> {
  const snapshot = await getDocs(query(devlog, orderBy("createdAt", "desc"), limit(DEVLOG_PAGE)));
  return snapshot.docs.map((post) => {
    const data = post.data();
    return {
      id: post.id,
      title: typeof data.title === "string" ? data.title : "",
      body: typeof data.body === "string" ? data.body : "",
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null,
    };
  });
}

export async function createDevlogPost(title: string, body: string): Promise<void> {
  await addDoc(devlog, {
    title: title.trim(),
    body: body.trim(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateDevlogPost(id: string, title: string, body: string): Promise<void> {
  await updateDoc(doc(devlog, id), {
    title: title.trim(),
    body: body.trim(),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteDevlogPost(id: string): Promise<void> {
  await deleteDoc(doc(devlog, id));
}
