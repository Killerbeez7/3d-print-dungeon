import { useState, useEffect } from "react";
import { getUserById } from "@/features/user/services/userService";
import type { UserProfileValues } from "../types/profile";

export const useProfile = (userId: string | undefined) => {
    const [userData, setUserData] = useState<UserProfileValues | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userId) {
            setError("No user ID provided");
            setLoading(false);
            return;
        }

        const fetchUser = async (): Promise<void> => {
            try {
                setLoading(true);
                setError(null);

                const user = await getUserById(userId);

                if (user) {
                    setUserData(user);
                    setError(null);
                } else {
                    setError("User not found");
                    setUserData(null);
                }
            } catch (error) {
                console.error("Error fetching user profile:", error);
                setError("Failed to load user profile");
                setUserData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [userId]);

    return {
        userData,
        loading,
        error,
    };
};