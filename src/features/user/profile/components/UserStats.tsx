import type { RawUserData } from "@/features/user/types/user";
import type { Timestamp } from "firebase/firestore";

interface UserStatsProps {
    user: RawUserData;
}

export const UserStats = ({ user }: UserStatsProps): React.ReactNode => {
    return (
        <div className="bg-bg-secondary rounded-lg p-6 shadow-md">
            <h2 className="text-2xl font-bold text-txt-primary mb-6">Statistics</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
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

            <div className="mt-8 pt-6 border-t border-br-secondary">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-txt-primary mb-2">
                            {user.stats.following}
                        </div>
                        <div className="text-sm text-txt-secondary">Following</div>
                    </div>

                    <div className="text-center">
                        <div className="text-2xl font-bold text-txt-primary mb-2">
                            {user.portfolio?.categories?.length ?? 0}
                        </div>
                        <div className="text-sm text-txt-secondary">Categories</div>
                    </div>

                    <div className="text-center">
                        <div className="text-2xl font-bold text-txt-primary mb-2">
                            {user.portfolio?.featuredWorks?.length ?? 0}
                        </div>
                        <div className="text-sm text-txt-secondary">Featured Works</div>
                    </div>

                    <div className="text-center">
                        <div className="text-2xl font-bold text-txt-primary mb-2">
                            {user.createdAt
                                ? new Date(
                                    (user.createdAt as Timestamp).toDate 
                                        ? (user.createdAt as Timestamp).toDate() 
                                        : (user.createdAt as Date)
                                  ).getFullYear()
                                : "N/A"}
                        </div>
                        <div className="text-sm text-txt-secondary">Member Since</div>
                    </div>
                </div>
            </div>
        </div>
    );
}; 