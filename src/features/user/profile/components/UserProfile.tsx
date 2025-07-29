/**
 * @file UserProfile.tsx
 * @description Displays the profile for a user
 * @usedIn UserProfilePage
 */

import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faEdit } from "@fortawesome/free-solid-svg-icons";
import type { ArtistProfile as UserProfileType } from "@/types/user";

interface UserProfileProps {
    user: UserProfileType;
    isOwnProfile: boolean;
}

export const UserProfile = ({
    user,
    isOwnProfile,
}: UserProfileProps): React.ReactNode => {
    return (
        <div className="bg-bg-secondary rounded-lg p-6 shadow-md">
            <div className="flex items-start space-x-6">
                {/* User Avatar */}
                <div className="flex-shrink-0">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-bg-surface">
                        {user.photoURL ? (
                            <img
                                src={user.photoURL}
                                alt={user.displayName}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-bg-primary">
                                <FontAwesomeIcon
                                    icon={faUser}
                                    className="text-3xl text-txt-secondary"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* User Info */}
                <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-txt-primary mb-2">
                                {user.displayName}
                            </h1>
                            {user.bio && (
                                <p className="text-txt-secondary text-lg mb-4">
                                    {user.bio}
                                </p>
                            )}
                        </div>

                        {isOwnProfile && (
                            <Link
                                to="/me/profile/edit"
                                className="flex items-center space-x-2 px-4 py-2 bg-bg-primary text-txt-primary rounded-md hover:bg-bg-surface transition-colors"
                            >
                                <FontAwesomeIcon icon={faEdit} />
                                <span>Edit Profile</span>
                            </Link>
                        )}
                    </div>

                    {/* User Stats */}
                    <div className="flex space-x-8 mt-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-txt-primary">
                                {user.stats.totalUploads}
                            </div>
                            <div className="text-sm text-txt-secondary">Uploads</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-txt-primary">
                                {user.stats.followers}
                            </div>
                            <div className="text-sm text-txt-secondary">Followers</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-txt-primary">
                                {user.stats.totalLikes}
                            </div>
                            <div className="text-sm text-txt-secondary">Likes</div>
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