/**
 * @file UserProfilePage.tsx
 * @description Displays the profile page for a user (artist or regular user)
 * @usedIn UserRoutes
 */

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { UserProfile } from "../components/UserProfile";
import { UserPortfolio } from "../components/UserPortfolio";
import { UserStats } from "../components/UserStats";
import { Spinner } from "@/features/shared/reusable/Spinner";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { ArtistProfile as ArtistProfileType } from "@/types/user";

export const UserProfilePage = (): React.ReactNode => {
    const { displayName } = useParams<{ displayName: string }>();
    const { currentUser } = useAuth();
    const [artist, setArtist] = useState<ArtistProfileType | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!displayName) {
            setError("User display name is required");
            setLoading(false);
            return;
        }

        // TODO: Fetch user data from API
        const fetchUser = async (): Promise<void> => {
            try {
                setLoading(true);
                // Replace with actual API call
                // const userData = await userService.getUserByDisplayName(displayName);
                // setArtist(userData);

                // Temporary mock data for development
                const mockUser: ArtistProfileType = {
                    id: "mock-id",
                    email: "user@example.com",
                    displayName: decodeURIComponent(displayName).replace(/-/g, " "),
                    photoURL: undefined,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    bio: "This is a sample user profile for development purposes.",
                    location: "Sample City",
                    website: "https://example.com",
                    socialLinks: {
                        twitter: "https://twitter.com/sampleuser",
                        instagram: "https://instagram.com/sampleuser",
                    },
                    preferences: {
                        emailNotifications: true,
                        pushNotifications: false,
                        privacyLevel: "public",
                    },
                    isArtist: true,
                    portfolio: {
                        featuredWorks: ["work1", "work2", "work3"],
                        categories: ["Fantasy", "Sci-Fi", "Characters"],
                        commissionRates: {
                            small: 50,
                            medium: 100,
                            large: 200,
                        },
                    },
                    stats: {
                        totalUploads: 25,
                        totalLikes: 150,
                        totalViews: 1200,
                        followers: 45,
                        following: 12,
                    },
                };

                setArtist(mockUser);
                setLoading(false);
            } catch (error) {
                console.error("Failed to load user:", error);
                setError("Failed to load user profile");
                setLoading(false);
            }
        };

        fetchUser();
    }, [displayName]);

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

    const isOwnProfile = currentUser?.uid === artist.id;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-6xl mx-auto">
                {/* User Header */}
                <UserProfile user={artist} isOwnProfile={isOwnProfile} />

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