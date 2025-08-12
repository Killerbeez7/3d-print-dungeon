import { getAvatarUrl } from "@/utils/avatar";
import { H1, Description, Label, StatValueSecondary } from "@/components/index";

import type { UserProfileValues } from "../types/profile";

interface UserProfileProps {
    user: UserProfileValues;
}

export const UserHeader = ({ user }: UserProfileProps): React.ReactNode => {
    return (
        <div className="bg-bg-secondary rounded-lg p-4 sm:p-6 shadow-md">
            <div className="flex items-start space-x-6">
                {/* User Avatar */}
                <div className="flex-shrink-0">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-bg-surface">
                        <img
                            src={getAvatarUrl(user.photoURL)}
                            alt={user.displayName || "User Avatar"}
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                {/* User Info */}
                <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <H1 size="3xl" className="mb-2">
                                {user.displayName}
                            </H1>
                            {user.bio && (
                                <Description className="mb-4">
                                    {user.bio}
                                </Description>
                            )}
                        </div>
                    </div>

                    {/* User Stats */}
                    <div className="flex space-x-4 sm:space-x-6 md:space-x-8 mt-4">
                        <div className="text-center">
                                                    <StatValueSecondary as="div" className="mb-1">
                            {user.stats.uploadsCount}
                        </StatValueSecondary>
                        <Label as="div" className="text-xs sm:text-sm">Uploads</Label>
                        </div>
                        <div className="text-center">
                                                    <StatValueSecondary as="div" className="mb-1">
                            {user.stats.followers}
                        </StatValueSecondary>
                        <Label as="div" className="text-xs sm:text-sm">Followers</Label>
                        </div>
                        <div className="text-center">
                                                    <StatValueSecondary as="div" className="mb-1">
                            {user.stats.likesCount}
                        </StatValueSecondary>
                        <Label as="div" className="text-xs sm:text-sm">Likes</Label>
                        </div>
                    </div>

                    {/* Social Links */}
                    {user.socialLinks && (
                        <div className="flex space-x-4 mt-4">
                            {user.socialLinks.twitter && (
                                <a
                                    href={user.socialLinks.twitter}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-txt-secondary hover:text-txt-primary transition-colors"
                                >
                                    Twitter
                                </a>
                            )}
                            {user.socialLinks.instagram && (
                                <a
                                    href={user.socialLinks.instagram}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-txt-secondary hover:text-txt-primary transition-colors"
                                >
                                    Instagram
                                </a>
                            )}
                            {user.socialLinks.facebook && (
                                <a
                                    href={user.socialLinks.facebook}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-txt-secondary hover:text-txt-primary transition-colors"
                                >
                                    Facebook
                                </a>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
