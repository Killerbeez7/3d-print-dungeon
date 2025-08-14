import { db } from "../../../config/firebaseConfig";
import {
    collection,
    query,
    orderBy,
    limit,
    getDocs,
    startAfter,
    QueryDocumentSnapshot,
    DocumentData,
    where,
} from "firebase/firestore";
import type { ModelData } from "../types/model";

export const PAGE_SIZE = 32;

export interface FetchModelsOptions {
    cursor?: QueryDocumentSnapshot<DocumentData>;
    limit?: number;
    categoryIds?: string[]; // array of category document ids
    search?: string;
    hideAI?: boolean;
    uploaderId?: string; // filter by uploader uid
}

// Fetch models with pagination + optional filters
export async function fetchModels(opts: FetchModelsOptions = {}): Promise<{
    models: ModelData[];
    nextCursor?: QueryDocumentSnapshot<DocumentData>;
}> {
    const {
        cursor,
        limit: lim = PAGE_SIZE,
        search,
        hideAI,
        categoryIds,
        uploaderId,
    } = opts;

    let q = query(collection(db, "models"), orderBy("createdAt", "desc"));

    // Apply category filter if provided
    if (categoryIds?.length) {
        q = query(
            q,
            where("categoryIds", "array-contains-any", categoryIds.slice(0, 10))
        );
    }

    // Apply AI filter if provided
    if (hideAI) {
        q = query(q, where("isAI", "==", false));
    }

    // Apply uploader filter if provided
    if (uploaderId) {
        q = query(q, where("uploaderId", "==", uploaderId));
    }

    // Handle search query
    if (search && search.trim()) {
        // First try to find by name prefix (most efficient)
        const nameQuery = query(
            collection(db, "models"),
            where("name", ">=", search),
            where("name", "<=", search + "\uf8ff"),
            orderBy("createdAt", "desc"),
            limit(lim)
        );

        const nameSnap = await getDocs(nameQuery);
        const nameMatches = nameSnap.docs.map((d) => ({ ...(d.data() as ModelData), id: d.id }));

        // Apply additional filters to name matches
        let filteredMatches = nameMatches;

        if (categoryIds?.length) {
            filteredMatches = filteredMatches.filter(model =>
                model.categoryIds?.some(catId => categoryIds.includes(catId))
            );
        }

        if (hideAI) {
            filteredMatches = filteredMatches.filter(model => !model.isAI);
        }

        // If we have enough results after filtering, return them
        if (filteredMatches.length >= lim) {
            return {
                models: filteredMatches.slice(0, lim),
                nextCursor: filteredMatches.length === lim ? nameSnap.docs[nameSnap.docs.length - 1] : undefined,
            };
        }

        // Otherwise, fetch more and filter client-side
        const allQuery = query(
            collection(db, "models"),
            orderBy("createdAt", "desc"),
            limit(100) // Fetch more to filter from
        );

        const allSnap = await getDocs(allQuery);
        const allModels = allSnap.docs.map((d) => ({ ...(d.data() as ModelData), id: d.id }));

        // Filter by search term across multiple fields (name, description, tags only)
        const searchFiltered = allModels.filter((model) => {
            const searchLower = search.toLowerCase();
            return (
                model.name?.toLowerCase().includes(searchLower) ||
                model.description?.toLowerCase().includes(searchLower) ||
                model.tags?.some(tag => tag.toLowerCase().includes(searchLower))
            );
        });

        // Apply additional filters
        let finalFiltered = searchFiltered;

        if (categoryIds?.length) {
            finalFiltered = finalFiltered.filter(model =>
                model.categoryIds?.some(catId => categoryIds.includes(catId))
            );
        }

        if (hideAI) {
            finalFiltered = finalFiltered.filter(model => !model.isAI);
        }

        return {
            models: finalFiltered.slice(0, lim),
            nextCursor: finalFiltered.length > lim ? allSnap.docs[allSnap.docs.length - 1] : undefined,
        };
    }

    // No search query - show all models with filters applied
    q = cursor ? query(q, startAfter(cursor), limit(lim)) : query(q, limit(lim));

    const snap = await getDocs(q);
    return {
        models: snap.docs.map((d) => ({ ...(d.data() as ModelData), id: d.id })),
        nextCursor:
            snap.docs.length === lim ? snap.docs[snap.docs.length - 1] : undefined,
    };
}

// Get a single model by ID
export async function getModelById(modelId: string): Promise<ModelData | null> {
    try {
        const { doc, getDoc } = await import("firebase/firestore");
        const modelRef = doc(db, "models", modelId);
        const modelSnap = await getDoc(modelRef);
        
        if (modelSnap.exists()) {
            return { ...(modelSnap.data() as ModelData), id: modelSnap.id };
        }
        return null;
    } catch (error) {
        console.error("Error fetching model by ID:", error);
        throw error;
    }
}

// Get models by category
// export async function getModelsByCategory(categoryId: string, limit: number = 10): Promise<ModelData[]> {
//     try {
//         const q = query(
//             collection(db, "models"),
//             where("categoryIds", "array-contains", categoryId),
//             orderBy("createdAt", "desc"),
//             limit(limit)
//         );
        
//         const snap = await getDocs(q);
//         return snap.docs.map((d) => ({ ...(d.data() as ModelData), id: d.id }));
//     } catch (error) {
//         console.error("Error fetching models by category:", error);
//         throw error;
//     }
// }

// Get models by user
// export async function getModelsByUser(userId: string, limit: number = 20): Promise<ModelData[]> {
//     try {
//         const q = query(
//             collection(db, "models"),
//             where("uploaderId", "==", userId),
//             orderBy("createdAt", "desc"),
//             limit(limit)
//         );
        
//         const snap = await getDocs(q);
//         return snap.docs.map((d) => ({ ...(d.data() as ModelData), id: d.id }));
//     } catch (error) {
//         console.error("Error fetching models by user:", error);
//         throw error;
//     }
// }
