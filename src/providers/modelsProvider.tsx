import { useState, useEffect, useCallback, ReactNode } from "react";
import { db } from "../config/firebase";
import {
    collection,
    query,
    onSnapshot,
    orderBy,
    where,
    doc,
    getDoc,
} from "firebase/firestore";
import { ModelsContext } from "../contexts/modelsContext";
import type { Model } from "@/types/model";

export function ModelsProvider({ children }: { children: ReactNode }) {
    const [models, setModels] = useState<Model[]>([]);
    const [userModels, setUserModels] = useState<Model[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [uploader, setUploader] = useState<Record<string, unknown> | null>(null);
    const [selectedRenderIndex, setSelectedRenderIndex] = useState<number>(-1);

    // listener to fetch all models
    useEffect(() => {
        setLoading(true);
        const q = query(collection(db, "models"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const items: Model[] = snapshot.docs.map(
                    (doc) =>
                        ({
                            id: doc.id,
                            ...doc.data(),
                        } as Model)
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
            where("userId", "==", userId),
            orderBy("createdAt", "desc")
        );
        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const items: Model[] = snapshot.docs.map(
                    (doc) =>
                        ({
                            id: doc.id,
                            ...doc.data(),
                        } as Model)
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
            const userDocRef = doc(db, "users", uploaderId);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
                setUploader(userDoc.data() as Record<string, unknown>);
            }
        } catch (err) {
            console.error("Error fetching uploader data:", err);
        }
    }, []);

    return (
        <ModelsContext.Provider
            value={{
                models,
                userModels,
                loading,
                uploader,
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
