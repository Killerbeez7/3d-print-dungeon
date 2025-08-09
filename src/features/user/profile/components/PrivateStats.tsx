import type { UserProfileValues } from "../types/profile";

interface PrivateStatsProps {
    user: UserProfileValues;
}

export const PrivateStats = ({ user }: PrivateStatsProps): React.ReactNode => {
    return (
        <div className="bg-bg-secondary rounded-lg p-6 shadow-md">
            <h2 className="text-2xl font-bold text-txt-primary mb-6">Private Statistics</h2>

            {/* Enhanced Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div className="text-center">
                    <div className="text-3xl font-bold text-txt-highlighted mb-2">
                        {user.stats.uploadsCount}
                    </div>
                    <div className="text-sm text-txt-secondary">Total Uploads</div>
                </div>

                <div className="text-center">
                    <div className="text-3xl font-bold text-txt-highlighted mb-2">
                        {user.stats.likesCount}
                    </div>
                    <div className="text-sm text-txt-secondary">Total Likes</div>
                </div>

                <div className="text-center">
                    <div className="text-3xl font-bold text-txt-highlighted mb-2">
                        {user.stats.viewsCount}
                    </div>
                    <div className="text-sm text-txt-secondary">Total Views</div>
                </div>

                <div className="text-center">
                    <div className="text-3xl font-bold text-txt-highlighted mb-2">
                        {user.stats.followers}
                    </div>
                    <div className="text-sm text-txt-secondary">Followers</div>
                </div>
            </div>

            {/* Additional Private Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div className="text-center">
                    <div className="text-2xl font-bold text-txt-primary mb-2">
                        {user.stats.following}
                    </div>
                    <div className="text-sm text-txt-secondary">Following</div>
                </div>

                <div className="text-center">
                    <div className="text-2xl font-bold text-txt-primary mb-2">
                        {user.stats.collectionsCount}
                    </div>
                    <div className="text-sm text-txt-secondary">Collections</div>
                </div>

                <div className="text-center">
                    <div className="text-2xl font-bold text-txt-primary mb-2">
                        {user.isPremium ? "Premium" : "Free"}
                    </div>
                    <div className="text-sm text-txt-secondary">Account Type</div>
                </div>

                <div className="text-center">
                    <div className="text-2xl font-bold text-txt-primary mb-2">
                        {user.isVerified ? "✓" : "—"}
                    </div>
                    <div className="text-sm text-txt-secondary">Verified</div>
                </div>
            </div>

            {/* Account Information */}
            <div className="mt-8 pt-6 border-t border-br-secondary">
                <h3 className="text-lg font-semibold text-txt-primary mb-4">Account Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-bg-surface rounded-lg p-4">
                        <div className="text-sm text-txt-secondary mb-1">Member Since</div>
                        <div className="text-txt-primary font-medium">
                            {user.createdAt instanceof Date 
                                ? user.createdAt.toLocaleDateString()
                                : new Date(user.createdAt).toLocaleDateString()
                            }
                        </div>
                    </div>
                    <div className="bg-bg-surface rounded-lg p-4">
                        <div className="text-sm text-txt-secondary mb-1">Last Updated</div>
                        <div className="text-txt-primary font-medium">
                            {user.updatedAt instanceof Date 
                                ? user.updatedAt.toLocaleDateString()
                                : new Date(user.updatedAt).toLocaleDateString()
                            }
                        </div>
                    </div>
                    {user.location && (
                        <div className="bg-bg-surface rounded-lg p-4">
                            <div className="text-sm text-txt-secondary mb-1">Location</div>
                            <div className="text-txt-primary font-medium">{user.location}</div>
                        </div>
                    )}
                    {user.website && (
                        <div className="bg-bg-surface rounded-lg p-4">
                            <div className="text-sm text-txt-secondary mb-1">Website</div>
                            <div className="text-txt-primary font-medium">
                                <a 
                                    href={user.website} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-accent hover:text-accent-hover"
                                >
                                    {user.website}
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Preferences Summary */}
            <div className="mt-8 pt-6 border-t border-br-secondary">
                <h3 className="text-lg font-semibold text-txt-primary mb-4">Privacy Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-bg-surface rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm text-txt-secondary mb-1">Public Profile</div>
                                <div className="text-xs text-txt-secondary">Allow others to view your profile</div>
                            </div>
                            <div className={`w-4 h-4 rounded-full ${user.preferences.publicProfile ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        </div>
                    </div>
                    <div className="bg-bg-surface rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm text-txt-secondary mb-1">Email Notifications</div>
                                <div className="text-xs text-txt-secondary">Receive email updates</div>
                            </div>
                            <div className={`w-4 h-4 rounded-full ${user.preferences.emailNotifications ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
