import { useEffect, useMemo, useState } from "react";
import { httpsCallable, getFunctions } from "firebase/functions";
import { doc, getDoc } from "firebase/firestore";
import { app, db } from "@/config/firebaseConfig";
import { useAuth } from "@/features/auth/hooks/useAuth";

interface FollowStatus {
    isFollowing: boolean;
    followersCount: number;
    followingCount: number;
}

export const useFollow = (targetUserId: string) => {
    const { currentUser } = useAuth();
    const [status, setStatus] = useState<FollowStatus>({
        isFollowing: false,
        followersCount: 0,
        followingCount: 0,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const canFollow = useMemo(() => {
        if (!currentUser) return true; // show button, will open auth modal
        return currentUser.uid !== targetUserId;
    }, [currentUser, targetUserId]);

    useEffect(() => {
        const fetchFollowStatus = async () => {
            if (!targetUserId) return;
            try {
                setLoading(true);
                setError(null);

                // Read target user's followersCount
                const targetPublicRef = doc(db, `users/${targetUserId}/public/data`);
                const targetPublicSnap = await getDoc(targetPublicRef);
                const followersCount = targetPublicSnap.exists()
                    ? Number((targetPublicSnap.get("stats.followersCount") as number) || 0)
                    : 0;

                // Read current user's followingCount (if logged in)
                let followingCount = 0;
                if (currentUser) {
                    const mePublicRef = doc(db, `users/${currentUser.uid}/public/data`);
                    const mePublicSnap = await getDoc(mePublicRef);
                    followingCount = mePublicSnap.exists()
                        ? Number((mePublicSnap.get("stats.followingCount") as number) || 0)
                        : 0;
                }

                // Check follow relation existence (if logged in)
                let isFollowing = false;
                if (currentUser && currentUser.uid !== targetUserId) {
                    const relationRef = doc(db, `follows/${currentUser.uid}_${targetUserId}`);
                    const relationSnap = await getDoc(relationRef);
                    isFollowing = relationSnap.exists();
                }

                setStatus({ isFollowing, followersCount, followingCount });
            } catch (e) {
                setError((e as Error).message);
            } finally {
                setLoading(false);
            }
        };
        fetchFollowStatus();
    }, [currentUser, targetUserId]);

    const toggleFollow = async () => {
        if (!currentUser) throw new Error("Not authenticated");
        setLoading(true);
        setError(null);
        try {
            const functions = getFunctions(app, "us-central1");
            const fn = httpsCallable<{ targetUserId: string }, FollowStatus>(functions, "toggleFollow");
            const res = await fn({ targetUserId });
            setStatus(res.data);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return {
        isFollowing: status.isFollowing,
        followersCount: status.followersCount,
        followingCount: status.followingCount,
        loading,
        error,
        toggleFollow,
        canFollow,
    };
};


