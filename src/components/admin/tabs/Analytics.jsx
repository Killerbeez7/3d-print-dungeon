import { useState, useEffect } from "react";
import { collection, query, getDocs, where, orderBy, limit } from "firebase/firestore";
import { db } from "../../../config/firebase";
import { MdPeople, MdFileUpload, MdRemoveRedEye, MdThumbUp } from "react-icons/md";

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

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                // Get date for time range filter
                const now = new Date();
                let startDate = new Date();
                switch (timeRange) {
                    case "week":
                        startDate.setDate(now.getDate() - 7);
                        break;
                    case "month":
                        startDate.setMonth(now.getMonth() - 1);
                        break;
                    case "year":
                        startDate.setFullYear(now.getFullYear() - 1);
                        break;
                }

                // Fetch users count
                const usersRef = collection(db, "users");
                const usersSnapshot = await getDocs(usersRef);
                const totalUsers = usersSnapshot.size;

                // Fetch models with views and likes
                const modelsRef = collection(db, "models");
                const modelsQuery = query(modelsRef, where("createdAt", ">=", startDate));
                const modelsSnapshot = await getDocs(modelsQuery);
                
                let totalModels = 0;
                let totalViews = 0;
                let totalLikes = 0;
                const models = [];

                modelsSnapshot.forEach(doc => {
                    const model = { id: doc.id, ...doc.data() };
                    totalModels++;
                    totalViews += model.views || 0;
                    totalLikes += model.likes || 0;
                    models.push(model);
                });

                // Get recent uploads
                const recentUploadsQuery = query(
                    modelsRef,
                    orderBy("createdAt", "desc"),
                    limit(5)
                );
                const recentUploadsSnapshot = await getDocs(recentUploadsQuery);
                const recentUploads = recentUploadsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                // Get popular models
                const popularModels = [...models]
                    .sort((a, b) => (b.views || 0) - (a.views || 0))
                    .slice(0, 5);

                // Get most active users
                const activeUsers = [...usersSnapshot.docs]
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .sort((a, b) => (b.uploadCount || 0) - (a.uploadCount || 0))
                    .slice(0, 5);

                setStats({
                    totalUsers,
                    totalModels,
                    totalViews,
                    totalLikes,
                    recentUploads,
                    popularModels,
                    activeUsers,
                });
            } catch (error) {
                console.error("Error fetching analytics:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [timeRange]);

    if (loading) {
        return <div className="text-center py-4">Loading analytics...</div>;
    }

    return (
        <div className="space-y-8">
            {/* Time Range Selector */}
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
                                    src={model.primaryRenderLowResUrl || "/placeholder.png"}
                                    alt={model.name}
                                    className="w-10 h-10 rounded object-cover"
                                />
                                <div>
                                    <p className="text-txt-primary font-medium">{model.name}</p>
                                    <p className="text-sm text-txt-secondary">
                                        {new Date(model.createdAt?.seconds * 1000).toLocaleDateString()}
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
                                        src={model.primaryRenderLowResUrl || "/placeholder.png"}
                                        alt={model.name}
                                        className="w-10 h-10 rounded object-cover"
                                    />
                                    <p className="text-txt-primary font-medium">{model.name}</p>
                                </div>
                                <div className="flex items-center space-x-2 text-txt-secondary">
                                    <MdRemoveRedEye />
                                    <span>{model.views || 0}</span>
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
                                        className="w-10 h-10 rounded-full"
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