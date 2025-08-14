import { useState, useEffect, useCallback, ReactNode } from "react";
import { db } from "@/config/firebaseConfig";
import { collection, query, onSnapshot, orderBy, where, doc, getDoc } from "firebase/firestore";
import { ModelsContext } from "@/features/models/context/modelsContext";
import type { ModelData } from "@/features/models/types/model";
import type { PublicProfileView } from "@/features/user/types/user";

export function ModelsProvider({ children }: { children: ReactNode }) {
    const [models, setModels] = useState<ModelData[]>([]);
    const [userModels, setUserModels] = useState<ModelData[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [uploader, setUploader] = useState<PublicProfileView | null>(null);
    const [selectedRenderIndex, setSelectedRenderIndex] = useState<number>(-1);

    // listener to fetch all models
    useEffect(() => {
        setLoading(true);
        const q = query(collection(db, "models"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const items: ModelData[] = snapshot.docs.map(
                    (doc) =>
                        ({
                            id: doc.id,
                            ...doc.data(),
                        } as ModelData)
                );
                setModels(items);
                setLoading(false);
            },
            (err) => {
                console.error("Error fetching models:", err);
                setLoading(false);
            }
        );
        return () => unsubscribe();
    }, []);

    // fetch models by userId
    const fetchModelsByUser = (userId: string): (() => void) => {
        setLoading(true);
        const q = query(
            collection(db, "models"),
            where("uploaderId", "==", userId),
            orderBy("createdAt", "desc")
        );
        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const items: ModelData[] = snapshot.docs.map(
                    (doc) =>
                        ({
                            id: doc.id,
                            ...doc.data(),
                        } as ModelData)
                );
                setUserModels(items);
                setLoading(false);
            },
            (err) => {
                console.error("Error fetching user models:", err);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    };

    const fetchUploader = useCallback(async (uploaderId: string) => {
        try {
            // Read public profile at users/{uid}/public/data and attach uid for PublicProfileView
            const publicDocRef = doc(collection(doc(db, "users", uploaderId), "public"), "data");
            const publicSnap = await getDoc(publicDocRef);
            if (publicSnap.exists()) {
                const data = publicSnap.data() as Omit<PublicProfileView, "uid">;
                setUploader({ ...data, uid: uploaderId });
            } else {
                setUploader(null);
            }
        } catch (err) {
            console.error("Error fetching uploader data:", err);
            setUploader(null);
        }
    }, []);

    return (
        <ModelsContext.Provider
            value={{
                models,
                userModels,
                loading,
                uploader: uploader ?? undefined,
                selectedRenderIndex,
                setSelectedRenderIndex,
                fetchUploader,
                fetchModelsByUser,
            }}
        >
            {children}
        </ModelsContext.Provider>
    );
}
