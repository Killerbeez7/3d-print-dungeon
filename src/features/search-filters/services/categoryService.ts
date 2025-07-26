import { collection, getDocs } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
}

export async function fetchCategories(): Promise<Category[]> {
  const snap = await getDocs(collection(db, "modelCategories"));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Category, "id">) }));
} 