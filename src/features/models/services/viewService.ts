import { useEffect, useState } from "react";
import { doc, onSnapshot, DocumentData, FirestoreError } from "firebase/firestore";
import { httpsCallable, getFunctions, HttpsCallableResult } from "firebase/functions";
import { db } from "@/config/firebaseConfig";
import { getViewerId } from "@/features/models/utils/getViewerId";

const functions = getFunctions();

export async function sendViewEvent(
    modelId: string,
    currentUser: { uid: string } | undefined
): Promise<unknown | null> {
    if (!modelId) {
        console.warn("sendViewEvent: modelId is required");
        return null;
    }
    try {
        const viewerId = await getViewerId(currentUser);
        // eslint-disable-next-line no-console
        console.log(`Tracking view event for model: ${modelId}, viewer: ${viewerId}`);
        const trackView = httpsCallable(functions, "trackModelView");
        const result: HttpsCallableResult<unknown> = await trackView({ modelId, viewerId });
        // eslint-disable-next-line no-console
        if ((result.data as { success?: boolean }).success) {
            console.log("View event tracked:", (result.data as { message?: string }).message);
        } else {
            console.log("View event skipped:", (result.data as { reason?: string }).reason);
        }
        return result.data;
    } catch (error) {
        if ((error as { code?: string }).code === "not-found") {
            // eslint-disable-next-line no-console
            console.warn("Model not found for view tracking:", modelId);
        } else {
            // eslint-disable-next-line no-console
            console.error("Error tracking view event:", error);
        }
        return null;
    }
}


export function useViewTracker(
    modelId: string,
    currentUser: { uid: string } | undefined
): void {
    const uid = currentUser?.uid;
    useEffect(() => {
        if (!modelId) return;
        sendViewEvent(modelId, currentUser);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [modelId, uid]);
}


export function useModelViewCount(
    modelId: string
): { count: number; loading: boolean; error: FirestoreError | null } {
    const [count, setCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<FirestoreError | null>(null);

    useEffect(() => {
        if (!modelId) {
            setCount(0);
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        const unsubscribe = onSnapshot(
            doc(db, "models", modelId),
            (docSnapshot: DocumentData) => {
                try {
                    if (docSnapshot.exists()) {
                        const data = docSnapshot.data() as { views?: number };
                        setCount(typeof data.views === "number" ? data.views : 0);
                    } else {
                        setCount(0);
                    }
                    setLoading(false);
                    setError(null);
                } catch (err) {
                    // eslint-disable-next-line no-console
                    console.error("Error reading view count:", err);
                    setError(err as FirestoreError);
                    setLoading(false);
                }
            },
            (err: FirestoreError) => {
                // eslint-disable-next-line no-console
                console.error("Error listening to model document:", err);
                setError(err);
                setLoading(false);
            }
        );
        return () => {
            unsubscribe();
        };
    }, [modelId]);
    return { count, loading, error };
}


export async function getModelViewCount(modelId: string): Promise<number> {
    if (!modelId) return 0;
    try {
        const getViewCount = httpsCallable(functions, "getModelViewCount");
        const result: HttpsCallableResult<unknown> = await getViewCount({ modelId });
        return (result.data as { viewCount?: number }).viewCount ?? 0;
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error getting view count:", error);
        return 0;
    }
}
