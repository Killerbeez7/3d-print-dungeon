/**
 * @file UserProfilePage.tsx
 * @description Displays the profile for a user
 * @usedIn userService.ts, userRoutes.ts, index.tsx
 */

import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
// hooks & services
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getUserByUsername } from "@/features/user/services/userService";
// components
import { UserHeader } from "../components/UserHeader";
import { UserPortfolio } from "../components/UserPortfolio";
import { UserStats } from "../components/UserStats";
import { Spinner } from "@/features/shared/reusable/Spinner";
// types
import type { UserProfileValues } from "../types/profile";

export const PublicProfilePage = (): React.ReactNode => {
    const { username } = useParams<{ username: string }>();
    const { currentUser } = useAuth();
    const [artist, setArtist] = useState<UserProfileValues | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!username) {
            setError("Username is required");
            setLoading(false);
            return;
        }

        const fetchUser = async (): Promise<void> => {
            try {
                setLoading(true);
                setError(null);

                const userData = await getUserByUsername(username);

                if (userData) {
                    setArtist(userData);
                } else {
                    setError("User not found");
                    setArtist(null);
                }
            } catch (error) {
                console.error("Failed to load user:", error);
                setError("Failed to load user profile");
                setArtist(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [username]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Spinner />
            </div>
        );
    }

    if (error || !artist) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-txt-primary mb-4">
                        User Not Found
                    </h1>
                    <p className="text-txt-secondary">
                        {error || "The user you're looking for doesn't exist."}
                    </p>
                </div>
            </div>
        );
    }

    const isOwnProfile = currentUser?.uid === artist.uid;

    return (
        <div className="container mx-auto px-4 py-4">
            <div className="max-w-6xl mx-auto">
                {/* User Header */}
                <UserHeader user={artist} isOwnProfile={isOwnProfile} />

                {/* User Portfolio */}
                <div className="mt-8">
                    <UserPortfolio user={artist} />
                </div>

                {/* User Stats */}
                <div className="mt-8">
                    <UserStats user={artist} />
                </div>
            </div>
        </div>
    );
};
