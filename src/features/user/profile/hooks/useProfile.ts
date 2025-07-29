import { useState, useEffect } from "react";
import { getUserFromDatabase } from "@/features/auth/services/authService";
import type { ProfileUserData } from "../types/profile";

export const useProfile = (userId: string | undefined) => {
    const [userData, setUserData] = useState<ProfileUserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userId) {
            setError("No user ID provided");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        const unsubscribe = getUserFromDatabase(userId, (data: ProfileUserData | null) => {
            if (data) {
                setUserData(data);
                setError(null);
            } else {
                setError("User not found");
                setUserData(null);
            }
            setLoading(false);
        });

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [userId]);

    return {
        userData,
        loading,
        error,
    };
};