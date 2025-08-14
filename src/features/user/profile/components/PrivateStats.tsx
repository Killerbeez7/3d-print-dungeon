import {
    H2,
    H3,
    StatValue,
    StatValueSecondary,
    Label,
    Metadata,
} from "@/components/index";
import type { PublicProfileView } from "@/features/user/types/user";
import type { Timestamp } from "firebase/firestore";

interface PrivateStatsProps {
    user: PublicProfileView; // For now we show only public-based stats
}

export const PrivateStats = ({ user }: PrivateStatsProps): React.ReactNode => {
    const formatDate = (value: Timestamp | Date | undefined): string => {
        if (!value) return "—";
        // Firestore Timestamp has toDate()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const asAny: any = value as any;
        const date: Date = typeof asAny?.toDate === "function" ? asAny.toDate() : (value as Date);
        return date.toLocaleDateString();
    };
    return (
        <div className="bg-bg-secondary rounded-lg p-4 sm:p-6 shadow-md">
            <H2 size="2xl" className="text-txt-primary mb-4 sm:mb-6">
                Private Statistics
            </H2>

            {/* Enhanced Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
                <div className="text-center">
                    <StatValue as="div" className="mb-1 sm:mb-2">
                        {user.stats.uploadsCount}
                    </StatValue>
                    <Label as="div" className="text-xs sm:text-sm">
                        Total Uploads
                    </Label>
                </div>

                <div className="text-center">
                    <StatValue as="div" className="mb-1 sm:mb-2">
                        {user.stats.likesCount}
                    </StatValue>
                    <Label as="div" className="text-xs sm:text-sm">
                        Total Likes
                    </Label>
                </div>

                <div className="text-center">
                    <StatValue as="div" className="mb-1 sm:mb-2">
                        {user.stats.viewsCount}
                    </StatValue>
                    <Label as="div" className="text-xs sm:text-sm">
                        Total Views
                    </Label>
                </div>

                <div className="text-center">
                    <StatValue as="div" className="mb-1 sm:mb-2">
                        {user.stats.followersCount}
                    </StatValue>
                    <Label as="div" className="text-xs sm:text-sm">
                        Followers
                    </Label>
                </div>
            </div>

            {/* Additional Private Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
                <div className="text-center">
                    <StatValueSecondary as="div" className="mb-1 sm:mb-2">
                        {user.stats.followingCount}
                    </StatValueSecondary>
                    <Label as="div" className="text-xs sm:text-sm">
                        Following
                    </Label>
                </div>

                <div className="text-center">
                    <StatValueSecondary as="div" className="mb-1 sm:mb-2">
                        {0}
                    </StatValueSecondary>
                    <Label as="div" className="text-xs sm:text-sm">
                        Collections
                    </Label>
                </div>

                <div className="text-center">
                    <StatValueSecondary as="div" className="mb-1 sm:mb-2">
                        {user.isPremium ? "Premium" : "Free"}
                    </StatValueSecondary>
                    <Label as="div" className="text-xs sm:text-sm">
                        Account Type
                    </Label>
                </div>

                <div className="text-center">
                    <StatValueSecondary as="div" className="mb-1 sm:mb-2">
                        {user.isVerified ? "✓" : "—"}
                    </StatValueSecondary>
                    <Label as="div" className="text-xs sm:text-sm">
                        Verified
                    </Label>
                </div>
            </div>

            {/* Account Information */}
            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-br-secondary">
                <H3 size="lg" className="text-txt-primary mb-4">
                    Account Information
                </H3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-bg-surface rounded-lg p-4">
                        <Metadata as="div" className="mb-1">
                            Member Since
                        </Metadata>
                        <div className="text-txt-primary font-medium">{formatDate(user.joinedAt)}</div>
                    </div>
                    <div className="bg-bg-surface rounded-lg p-4">
                        <Metadata as="div" className="mb-1">
                            Last Active
                        </Metadata>
                        <div className="text-txt-primary font-medium">{formatDate(user.lastActiveAt)}</div>
                    </div>
                    {user.location && (
                        <div className="bg-bg-surface rounded-lg p-4">
                            <Metadata as="div" className="mb-1">
                                Location
                            </Metadata>
                            <div className="text-txt-primary font-medium">
                                {user.location}
                            </div>
                        </div>
                    )}
                    {user.website && (
                        <div className="bg-bg-surface rounded-lg p-4">
                            <Metadata as="div" className="mb-1">
                                Website
                            </Metadata>
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

            {/* Preferences Summary (not available on public view) */}
        </div>
    );
};
