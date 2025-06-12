import { useState, useEffect, useMemo, useCallback } from "react";
import { collection, query, getDocs, where, orderBy, limit } from "firebase/firestore";
import { db } from "../../../config/firebase";
import { MdPeople, MdFileUpload, MdRemoveRedEye, MdThumbUp, MdDelete } from "react-icons/md";
import { cleanupAllViews } from "../../../services/viewService";
import { getThumbnailUrl, THUMBNAIL_SIZES } from "../../../utils/imageUtils";

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;
let statsCache = {
    data: null,
    timestamp: 0,
    timeRange: null
};

export const Analytics = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalModels: 0,
        totalViews: 0,
        totalLikes: 0,
        recentUploads: [],
        popularModels: [],
        activeUsers: [],
    });
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState("week"); // week, month, year
    const [isCleaningViews, setIsCleaningViews] = useState(false);

    // Memoize the date calculation
    const startDate = useMemo(() => {
        const now = new Date();
        const date = new Date();
        switch (timeRange) {
            case "week":
                date.setDate(now.getDate() - 7);
                break;
            case "month":
                date.setMonth(now.getMonth() - 1);
                break;
            case "year":
                date.setFullYear(now.getFullYear() - 1);
                break;
        }
        return date;
    }, [timeRange]);

    const fetchAnalytics = useCallback(async () => {
        try {
            // Check cache
            const now = Date.now();
            if (
                statsCache.data &&
                statsCache.timeRange === timeRange &&
                now - statsCache.timestamp < CACHE_DURATION
            ) {
                setStats(statsCache.data);
                setLoading(false);
                return;
            }

            // Fetch users with their uploads array
            const usersRef = collection(db, "users");
            const usersSnapshot = await getDocs(usersRef);
            const totalUsers = usersSnapshot.size;

            // Fetch models with views
            const modelsRef = collection(db, "models");
            const modelsQuery = query(modelsRef, where("createdAt", ">=", startDate));
            const modelsSnapshot = await getDocs(modelsQuery);
            
            let totalModels = 0;
            let totalViews = 0;
            const models = [];

            modelsSnapshot.forEach(doc => {
                const model = { id: doc.id, ...doc.data() };
                totalModels++;
                totalViews += model.views || 0;
                models.push(model);
            });

            // Get total likes from likes collection
            const likesRef = collection(db, "likes");
            const likesSnapshot = await getDocs(likesRef);
            const totalLikes = likesSnapshot.size;

            // Get recent uploads with thumbnails
            const recentUploadsQuery = query(
                modelsRef,
                orderBy("createdAt", "desc"),
                limit(5)
            );
            const recentUploadsSnapshot = await getDocs(recentUploadsQuery);
            const recentUploads = recentUploadsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                thumbnail: getThumbnailUrl(doc.data().renderPrimaryUrl, THUMBNAIL_SIZES.SMALL) || doc.data().posterUrl || "/placeholder.png"
            }));

            // Get popular models with thumbnails
            const popularModels = [...models]
                .sort((a, b) => (b.views || 0) - (a.views || 0))
                .slice(0, 5)
                .map(model => ({
                    ...model,
                    thumbnail: getThumbnailUrl(model.renderPrimaryUrl, THUMBNAIL_SIZES.SMALL) || model.posterUrl || "/placeholder.png"
                }));

            // Get most active users based on uploads array length
            const activeUsers = [...usersSnapshot.docs]
                .map(doc => ({ 
                    id: doc.id, 
                    ...doc.data(),
                    uploadCount: doc.data().uploads?.length || 0
                }))
                .filter(user => user.uploads && user.uploads.length > 0)
                .sort((a, b) => b.uploadCount - a.uploadCount)
                .slice(0, 5);

            const newStats = {
                totalUsers,
                totalModels,
                totalViews,
                totalLikes,
                recentUploads,
                popularModels,
                activeUsers,
            };

            // Update cache
            statsCache = {
                data: newStats,
                timestamp: now,
                timeRange
            };

            setStats(newStats);
        } catch (error) {
            console.error("Error fetching analytics:", error);
        } finally {
            setLoading(false);
        }
    }, [timeRange, startDate]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    const handleCleanupViews = async () => {
        if (!window.confirm('Are you sure you want to reset all view counts? This action cannot be undone.')) {
            return;
        }

        setIsCleaningViews(true);
        try {
            await cleanupAllViews();
            // Refresh stats after cleanup
            await fetchAnalytics();
            alert('Successfully reset all view counts!');
        } catch (error) {
            console.error('Error cleaning up views:', error);
            alert('Failed to reset view counts. Check console for details.');
        } finally {
            setIsCleaningViews(false);
        }
    };

    if (loading) {
        return <div className="text-center py-4">Loading analytics...</div>;
    }

    return (
        <div className="space-y-8">
            {/* Time Range Selector and Cleanup Button */}
            <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                    {["week", "month", "year"].map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium ${
                                timeRange === range
                                    ? "bg-accent text-white"
                                    : "bg-bg-secondary text-txt-secondary hover:text-txt-primary"
                            }`}
                        >
                            Last {range}
                        </button>
                    ))}
                </div>
                <button
                    onClick={handleCleanupViews}
                    disabled={isCleaningViews}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <MdDelete className="w-5 h-5" />
                    {isCleaningViews ? 'Cleaning...' : 'Reset All Views'}
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-bg-secondary rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-txt-secondary">Total Users</p>
                            <p className="text-2xl font-bold text-txt-primary">{stats.totalUsers}</p>
                        </div>
                        <MdPeople className="text-accent" size={24} />
                    </div>
                </div>

                <div className="bg-bg-secondary rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-txt-secondary">Total Models</p>
                            <p className="text-2xl font-bold text-txt-primary">{stats.totalModels}</p>
                        </div>
                        <MdFileUpload className="text-accent" size={24} />
                    </div>
                </div>

                <div className="bg-bg-secondary rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-txt-secondary">Total Views</p>
                            <p className="text-2xl font-bold text-txt-primary">{stats.totalViews}</p>
                        </div>
                        <MdRemoveRedEye className="text-accent" size={24} />
                    </div>
                </div>

                <div className="bg-bg-secondary rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-txt-secondary">Total Likes</p>
                            <p className="text-2xl font-bold text-txt-primary">{stats.totalLikes}</p>
                        </div>
                        <MdThumbUp className="text-accent" size={24} />
                    </div>
                </div>
            </div>

            {/* Detailed Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Uploads */}
                <div className="bg-bg-secondary rounded-lg p-6">
                    <h3 className="text-lg font-medium mb-4">Recent Uploads</h3>
                    <div className="space-y-4">
                        {stats.recentUploads.map((model) => (
                            <div key={model.id} className="flex items-center space-x-3">
                                <img
                                    src={model.thumbnail}
                                    alt={model.name}
                                    className="w-16 h-16 rounded object-cover bg-bg-surface"
                                />
                                <div>
                                    <p className="text-txt-primary font-medium">{model.name}</p>
                                    <p className="text-sm text-txt-secondary">
                                        {new Date(model.createdAt?.seconds * 1000).toLocaleDateString()}
                                    </p>
                                    <p className="text-xs text-txt-secondary">
                                        {model.views || 0} views
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Popular Models */}
                <div className="bg-bg-secondary rounded-lg p-6">
                    <h3 className="text-lg font-medium mb-4">Popular Models</h3>
                    <div className="space-y-4">
                        {stats.popularModels.map((model) => (
                            <div key={model.id} className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <img
                                        src={model.thumbnail}
                                        alt={model.name}
                                        className="w-16 h-16 rounded object-cover bg-bg-surface"
                                    />
                                    <div>
                                        <p className="text-txt-primary font-medium">{model.name}</p>
                                        <p className="text-sm text-txt-secondary">
                                            By {model.uploaderDisplayName || "Anonymous"}
                                        </p>
                                        <div className="flex items-center space-x-2 text-txt-secondary text-sm">
                                            <MdRemoveRedEye className="w-4 h-4" />
                                            <span>{model.views || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Active Users */}
                <div className="bg-bg-secondary rounded-lg p-6">
                    <h3 className="text-lg font-medium mb-4">Most Active Users</h3>
                    <div className="space-y-4">
                        {stats.activeUsers.map((user) => (
                            <div key={user.id} className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <img
                                        src={user.photoURL || "/default-avatar.png"}
                                        alt={user.displayName}
                                        className="w-10 h-10 rounded-full bg-bg-surface"
                                    />
                                    <div>
                                        <p className="text-txt-primary font-medium">
                                            {user.displayName || "Anonymous"}
                                        </p>
                                        <p className="text-sm text-txt-secondary">
                                            {user.uploadCount || 0} uploads
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
