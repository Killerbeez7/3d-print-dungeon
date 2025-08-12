import type { UserProfileValues } from "../types/profile";
import { H2, H3, StatValue, StatValueSecondary, Label, Metadata, HelpText } from "@/components/index";

interface PrivateStatsProps {
    user: UserProfileValues;
}

export const PrivateStats = ({ user }: PrivateStatsProps): React.ReactNode => {
    return (
        <div className="bg-bg-secondary rounded-lg p-4 sm:p-6 shadow-md">
            <H2 size="2xl" className="text-txt-primary mb-4 sm:mb-6">Private Statistics</H2>

            {/* Enhanced Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
                <div className="text-center">
                    <StatValue as="div" className="mb-1 sm:mb-2">
                        {user.stats.uploadsCount}
                    </StatValue>
                    <Label as="div" className="text-xs sm:text-sm">Total Uploads</Label>
                </div>

                <div className="text-center">
                    <StatValue as="div" className="mb-1 sm:mb-2">
                        {user.stats.likesCount}
                    </StatValue>
                    <Label as="div" className="text-xs sm:text-sm">Total Likes</Label>
                </div>

                <div className="text-center">
                    <StatValue as="div" className="mb-1 sm:mb-2">
                        {user.stats.viewsCount}
                    </StatValue>
                    <Label as="div" className="text-xs sm:text-sm">Total Views</Label>
                </div>

                <div className="text-center">
                    <StatValue as="div" className="mb-1 sm:mb-2">
                        {user.stats.followers}
                    </StatValue>
                    <Label as="div" className="text-xs sm:text-sm">Followers</Label>
                </div>
            </div>

            {/* Additional Private Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
                <div className="text-center">
                    <StatValueSecondary as="div" className="mb-1 sm:mb-2">
                        {user.stats.following}
                    </StatValueSecondary>
                    <Label as="div" className="text-xs sm:text-sm">Following</Label>
                </div>

                <div className="text-center">
                    <StatValueSecondary as="div" className="mb-1 sm:mb-2">
                        {user.stats.collectionsCount}
                    </StatValueSecondary>
                    <Label as="div" className="text-xs sm:text-sm">Collections</Label>
                </div>

                <div className="text-center">
                    <StatValueSecondary as="div" className="mb-1 sm:mb-2">
                        {user.isPremium ? "Premium" : "Free"}
                    </StatValueSecondary>
                    <Label as="div" className="text-xs sm:text-sm">Account Type</Label>
                </div>

                <div className="text-center">
                    <StatValueSecondary as="div" className="mb-1 sm:mb-2">
                        {user.isVerified ? "✓" : "—"}
                    </StatValueSecondary>
                    <Label as="div" className="text-xs sm:text-sm">Verified</Label>
                </div>
            </div>

            {/* Account Information */}
            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-br-secondary">
                <H3 size="lg" className="text-txt-primary mb-4">Account Information</H3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-bg-surface rounded-lg p-4">
                        <Metadata as="div" className="mb-1">Member Since</Metadata>
                        <div className="text-txt-primary font-medium">
                            {user.createdAt instanceof Date 
                                ? user.createdAt.toLocaleDateString()
                                : new Date(user.createdAt).toLocaleDateString()
                            }
                        </div>
                    </div>
                    <div className="bg-bg-surface rounded-lg p-4">
                        <Metadata as="div" className="mb-1">Last Updated</Metadata>
                        <div className="text-txt-primary font-medium">
                            {user.updatedAt instanceof Date 
                                ? user.updatedAt.toLocaleDateString()
                                : new Date(user.updatedAt).toLocaleDateString()
                            }
                        </div>
                    </div>
                    {user.location && (
                        <div className="bg-bg-surface rounded-lg p-4">
                            <Metadata as="div" className="mb-1">Location</Metadata>
                            <div className="text-txt-primary font-medium">{user.location}</div>
                        </div>
                    )}
                    {user.website && (
                        <div className="bg-bg-surface rounded-lg p-4">
                            <Metadata as="div" className="mb-1">Website</Metadata>
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
            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-br-secondary">
                <h3 className="text-lg font-semibold text-txt-primary mb-4">Privacy Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-bg-surface rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Metadata as="div" className="mb-1">Public Profile</Metadata>
                                <HelpText as="div">Allow others to view your profile</HelpText>
                            </div>
                            <div className={`w-4 h-4 rounded-full ${user.preferences.publicProfile ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        </div>
                    </div>
                    <div className="bg-bg-surface rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Metadata as="div" className="mb-1">Email Notifications</Metadata>
                                <HelpText as="div">Receive email updates</HelpText>
                            </div>
                            <div className={`w-4 h-4 rounded-full ${user.preferences.emailNotifications ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
