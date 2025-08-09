import { useState, useEffect } from "react";
import type { UserProfileValues } from "../../types/profile";

interface StatsTabProps {
    userData: UserProfileValues;
}

interface ChartData {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        backgroundColor: string[];
        borderColor: string[];
        borderWidth: number;
    }[];
}

export const StatsTab = ({ userData }: StatsTabProps) => {
    const [chartData, setChartData] = useState<ChartData | null>(null);
    const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "year">("month");

    console.log(chartData);
    
    useEffect(() => {
        // Generate mock chart data - in real app, this would come from analytics
        const generateChartData = () => {
            const periods = selectedPeriod === "week" ? 7 : selectedPeriod === "month" ? 30 : 365;
            const labels = [];
            const uploadData = [];
            const viewData = [];
            const likeData = [];

            for (let i = periods - 1; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                labels.push(date.toLocaleDateString("en-US", { 
                    month: "short", 
                    day: "numeric" 
                }));
                
                // Mock data - replace with real analytics
                uploadData.push(Math.floor(Math.random() * 5));
                viewData.push(Math.floor(Math.random() * 100));
                likeData.push(Math.floor(Math.random() * 20));
            }

            return {
                labels,
                datasets: [
                    {
                        label: "Uploads",
                        data: uploadData,
                        backgroundColor: ["rgba(99, 102, 241, 0.2)"],
                        borderColor: ["rgba(99, 102, 241, 1)"],
                        borderWidth: 2,
                    },
                    {
                        label: "Views",
                        data: viewData,
                        backgroundColor: ["rgba(34, 197, 94, 0.2)"],
                        borderColor: ["rgba(34, 197, 94, 1)"],
                        borderWidth: 2,
                    },
                    {
                        label: "Likes",
                        data: likeData,
                        backgroundColor: ["rgba(239, 68, 68, 0.2)"],
                        borderColor: ["rgba(239, 68, 68, 1)"],
                        borderWidth: 2,
                    },
                ],
            };
        };

        setChartData(generateChartData());
    }, [selectedPeriod]);

    const stats = [
        {
            title: "Total Uploads",
            value: userData.stats?.uploadsCount || 0,
            icon: "fas fa-upload",
            color: "text-accent",
            bgColor: "bg-accent/10",
        },
        {
            title: "Total Views",
            value: userData.stats?.viewsCount || 0,
            icon: "fas fa-eye",
            color: "text-success",
            bgColor: "bg-success/10",
        },
        {
            title: "Total Likes",
            value: userData.stats?.likesCount || 0,
            icon: "fas fa-heart",
            color: "text-red-500",
            bgColor: "bg-red-50",
        },
        {
            title: "Followers",
            value: userData.stats?.followers || 0,
            icon: "fas fa-users",
            color: "text-accent",
            bgColor: "bg-accent/10",
        },
        {
            title: "Following",
            value: userData.stats?.following || 0,
            icon: "fas fa-user-plus",
            color: "text-orange-500",
            bgColor: "bg-orange-50",
        },
        {
            title: "Avg. Rating",
            value: "4.8",
            icon: "fas fa-star",
            color: "text-yellow-500",
            bgColor: "bg-yellow-50",
        },
    ];

    const achievements = [
        {
            title: "First Upload",
            description: "Uploaded your first model",
            icon: "fas fa-trophy",
            achieved: true,
            date: "2024-01-15",
        },
        {
            title: "10 Uploads",
            description: "Reached 10 model uploads",
            icon: "fas fa-medal",
            achieved: true,
            date: "2024-03-20",
        },
        {
            title: "100 Views",
            description: "Reached 100 total views",
            icon: "fas fa-eye",
            achieved: true,
            date: "2024-02-10",
        },
        {
            title: "50 Likes",
            description: "Received 50 total likes",
            icon: "fas fa-heart",
            achieved: false,
            progress: 35,
        },
        {
            title: "Community Helper",
            description: "Helped 10 other users",
            icon: "fas fa-hands-helping",
            achieved: false,
            progress: 7,
        },
    ];

    return (
        <div className="space-y-6">
            {/* Period Selector */}
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-txt-primary">Analytics</h3>
                <div className="flex gap-2">
                    {(["week", "month", "year"] as const).map((period) => (
                        <button
                            key={period}
                            onClick={() => setSelectedPeriod(period)}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                                selectedPeriod === period
                                    ? "bg-accent text-white"
                                    : "bg-bg-secondary text-txt-secondary hover:text-txt-primary"
                            }`}
                        >
                            {period.charAt(0).toUpperCase() + period.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className="bg-bg-secondary rounded-lg p-4 text-center hover:shadow-md transition-all duration-200"
                    >
                        <div className={`w-12 h-12 rounded-full ${stat.bgColor} flex items-center justify-center mx-auto mb-3`}>
                            <i className={`${stat.icon} ${stat.color} text-lg`}></i>
                        </div>
                        <div className="text-2xl font-bold text-txt-primary mb-1">
                            {stat.value}
                        </div>
                        <div className="text-sm text-txt-secondary">{stat.title}</div>
                    </div>
                ))}
            </div>

            {/* Chart Section */}
            <div className="bg-bg-secondary rounded-lg p-6">
                <h4 className="text-lg font-semibold text-txt-primary mb-4">Activity Overview</h4>
                <div className="h-64 flex items-center justify-center text-txt-secondary">
                    <div className="text-center">
                        <i className="fas fa-chart-line text-4xl mb-4"></i>
                        <p>Chart visualization would be implemented here</p>
                        <p className="text-sm mt-2">Using Chart.js or similar library</p>
                    </div>
                </div>
            </div>

            {/* Achievements Section */}
            <div className="bg-bg-secondary rounded-lg p-6">
                <h4 className="text-lg font-semibold text-txt-primary mb-4">Achievements</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {achievements.map((achievement, index) => (
                        <div
                            key={index}
                            className={`p-4 rounded-lg border transition-all duration-200 ${
                                achievement.achieved
                                    ? "border-green-500 bg-green-50"
                                    : "border-br-primary bg-bg-surface"
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                        achievement.achieved
                                            ? "bg-green-500 text-white"
                                            : "bg-bg-secondary text-txt-secondary"
                                    }`}
                                >
                                    <i className={achievement.icon}></i>
                                </div>
                                <div className="flex-1">
                                    <h5 className="font-semibold text-txt-primary">
                                        {achievement.title}
                                    </h5>
                                    <p className="text-sm text-txt-secondary">
                                        {achievement.description}
                                    </p>
                                    {achievement.achieved && achievement.date && (
                                        <p className="text-xs text-green-600 mt-1">
                                            Achieved {new Date(achievement.date).toLocaleDateString()}
                                        </p>
                                    )}
                                    {!achievement.achieved && achievement.progress && (
                                        <div className="mt-2">
                                            <div className="flex justify-between text-xs text-txt-secondary mb-1">
                                                <span>Progress</span>
                                                <span>{achievement.progress}%</span>
                                            </div>
                                            <div className="w-full bg-bg-primary rounded-full h-2">
                                                <div
                                                    className="bg-accent h-2 rounded-full transition-all duration-300"
                                                    style={{ width: `${achievement.progress}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-bg-secondary rounded-lg p-6">
                <h4 className="text-lg font-semibold text-txt-primary mb-4">Recent Activity</h4>
                <div className="space-y-3">
                    {[
                        { action: "Uploaded", item: "Dragon Model", time: "2 hours ago" },
                        { action: "Received", item: "5 likes on Castle Model", time: "1 day ago" },
                        { action: "Gained", item: "10 new followers", time: "2 days ago" },
                        { action: "Achieved", item: "100 total views milestone", time: "3 days ago" },
                    ].map((activity, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-bg-surface rounded-lg">
                            <div className="w-2 h-2 bg-accent rounded-full"></div>
                            <div className="flex-1">
                                <span className="text-txt-primary">{activity.action}</span>
                                <span className="text-txt-secondary"> {activity.item}</span>
                            </div>
                            <span className="text-xs text-txt-secondary">{activity.time}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};