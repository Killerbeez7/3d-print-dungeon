import { collection, getDocs } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";
import { setLogLevel } from "firebase/firestore";
setLogLevel("debug");          // add once at app boot (main.tsx)

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
}

export async function fetchCategories(): Promise<Category[]> {
  const snap = await getDocs(collection(db, "categories"));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Category, "id">) }));
} 