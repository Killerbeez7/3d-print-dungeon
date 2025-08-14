import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
// hooks & services
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getUserByUsername } from "@/features/user/services/userService";
// components
import { UserHeader } from "../components/UserHeader";
import { UserPortfolio } from "../components/UserPortfolio";
import { UserStats } from "../components/UserStats";
import { ProfileSettingsPanel } from "../components/ProfileSettingsPanel";
import { PrivateStats } from "../components/PrivateStats";
import { Spinner } from "@/features/shared/reusable/Spinner";
import { H1 } from "@/components/ResponsiveHeading";
// types
import type { PublicProfileView } from "@/features/user/types/user";

export const PublicProfilePage = (): React.ReactNode => {
    const { username } = useParams<{ username: string }>();
    const { currentUser } = useAuth();
    const [artist, setArtist] = useState<PublicProfileView | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    if (process.env.NODE_ENV !== "production") {
        console.debug('PublicProfilePage rendered with:', { username, currentUser: !!currentUser });
    }

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

                if (process.env.NODE_ENV !== "production") {
                    console.debug('Fetching user data for username:', username);
                }
                const userData = await getUserByUsername(username);
                if (process.env.NODE_ENV !== "production") {
                    console.debug('Received user data:', userData);
                }

                if (userData) {
                    setArtist(userData);
                } else {
                    setError("User not found");
                    setArtist(null);
                }
            } catch (error) {
                if (process.env.NODE_ENV !== "production") {
                    console.debug("Failed to load user:", error);
                }
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
                    <H1 size="2xl" className="text-txt-primary mb-4">
                        User Not Found
                    </H1>
                    <p className="text-txt-secondary">
                        {error || "The user you're looking for doesn't exist."}
                    </p>
                </div>
            </div>
        );
    }

    const isOwner = currentUser?.uid === artist.uid;

    // Debug logging
    if (process.env.NODE_ENV !== "production") {
        console.debug('PublicProfilePage Debug:', {
            currentUserUid: currentUser?.uid,
            currentUserEmail: currentUser?.email,
            artistUid: artist.uid,
            artistKeys: Object.keys(artist),
            isOwner,
            artistUsername: artist.username,
            currentUserUsername: currentUser?.displayName,
            artistDisplayName: artist.displayName
        });
    }

    return (
        <div className="min-h-screen bg-bg-primary">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Shared Profile Header */}
                <UserHeader user={artist} />

                {/* Owner-only Settings Panel */}
                {isOwner && (
                    <div className="mt-6">
                        <ProfileSettingsPanel user={artist} />
                    </div>
                )}

                {/* Shared User Portfolio */}
                <div className="mt-8">
                    <UserPortfolio user={artist} />
                </div>

                {/* Conditional Stats - Private for owner, Public for others */}
                <div className="mt-8">
                    {isOwner ? (
                        <PrivateStats user={artist} />
                    ) : (
                        <UserStats user={artist} />
                    )}
                </div>
            </div>
        </div>
    );
};
