import { useEffect, useState } from "react";
import { useViewTracker } from "@/features/models/services/viewService";
import { doc, onSnapshot, DocumentData } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";
import { Spinner } from "@/features/shared/reusable/Spinner";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { FC } from "react";

export interface PostViewProps {
    postId: string;
}

export const PostView: FC<PostViewProps> = ({ postId }) => {
    const { currentUser } = useAuth();
    useViewTracker(postId, currentUser ?? undefined);
    const [viewCount, setViewCount] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Listen to view count changes
    useEffect(() => {
        const postRef = doc(db, "posts", postId);
        const unsubscribe = onSnapshot(postRef, (docSnap: DocumentData) => {
            if (docSnap.exists()) {
                const data = docSnap.data() as { viewCount?: number };
                setViewCount(typeof data.viewCount === "number" ? data.viewCount : 0);
            }
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, [postId]);

    if (isLoading) {
        return <Spinner size={24} />;
    }

    return (
        <div className="post-view">
            <div className="view-count">{`Views: ${viewCount}`}</div>
        </div>
    );
};
