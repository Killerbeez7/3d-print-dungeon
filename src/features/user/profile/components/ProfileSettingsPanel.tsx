import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faImages,
    faHeart,
    faChartLine,
    faUser,
    faBookmark,
    faTrophy,
    faCog,
    faEye,
    faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

import { Spinner } from "@/features/shared/reusable/Spinner";
import { ReusableCarousel } from "@/features/shared/reusable/carousel/ReusableCarousel";
import { ProgressiveImage } from "@/features/shared/reusable/ProgressiveImage";
import { getThumbnailUrl } from "@/utils/imageUtils";
import { STATIC_ASSETS } from "@/config/assetsConfig";
import { useFetchModels } from "@/features/models/hooks/useFetchModels";
import { ROUTES } from "@/constants/routeConstants";
import type { UserProfileValues, Tab } from "../types/profile";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import type { ModelData } from "@/features/models/types/model";

// Model card component for the carousel (smaller version)
const ModelCarouselCard = ({
    model,
    priority = false,
}: {
    model: ModelData;
    priority?: boolean;
}) => {
    const thumbUrl =
        getThumbnailUrl(model.renderPrimaryUrl ?? null, "MEDIUM") ||
        STATIC_ASSETS.PLACEHOLDER_IMAGE;
    const mouseDownPos = useRef<{ x: number; y: number } | null>(null);

    const handleMouseDown = (e: React.MouseEvent) => {
        mouseDownPos.current = { x: e.clientX, y: e.clientY };
    };

    const handleClick = (e: React.MouseEvent) => {
        // Check if mouse moved significantly since mousedown (indicating a drag)
        if (mouseDownPos.current) {
            const deltaX = Math.abs(e.clientX - mouseDownPos.current.x);
            const deltaY = Math.abs(e.clientY - mouseDownPos.current.y);

            // If mouse moved more than 5px in any direction, consider it a drag
            if (deltaX > 5 || deltaY > 5) {
                e.preventDefault();
                return;
            }
        }

        // Navigate to model page
        window.location.href = `/model/${model.id}`;
    };

    return (
        <div
            className="group cursor-pointer"
            onMouseDown={handleMouseDown}
            onClick={handleClick}
        >
            <article className="relative bg-bg-surface rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 ease-out w-full">
                {/* Image container with zoom effect */}
                <div className="overflow-hidden" style={{ height: 160 }}>
                    <div className="w-full h-full transform transition-transform duration-500 ease-out group-hover:scale-110">
                        {priority ? (
                            <img
                                src={thumbUrl}
                                alt={model.name}
                                className="w-full h-full object-cover"
                                loading="eager"
                                {...(priority && { fetchPriority: "high" as const })}
                                decoding="async"
                            />
                        ) : (
                            <ProgressiveImage
                                src={thumbUrl}
                                alt={model.name}
                                className="w-full h-full object-cover"
                            />
                        )}
                    </div>
                </div>

                {/* Enhanced overlay with slide-up animation */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent flex items-end opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out transform translate-y-4 group-hover:translate-y-0 rounded-lg pointer-events-none">
                    <div className="text-white p-3 w-full">
                        <div className="mb-1.5">
                            <h6 className="font-bold text-xs leading-tight mb-0.5 truncate text-white drop-shadow-lg">
                                {model.name}
                            </h6>
                            <div className="flex items-center gap-1.5">
                                <span className="text-[11px] text-gray-300 font-medium truncate">
                                    by {model.uploaderDisplayName || "Unknown"}
                                </span>
                                <div className="w-0.5 h-0.5 bg-white/60 rounded-full"></div>
                                <span className="text-[9px] text-gray-400">3D Model</span>
                            </div>
                        </div>

                        {/* Action indicator with FontAwesome icons */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                    <FontAwesomeIcon
                                        icon={faHeart}
                                        className="w-2.5 h-2.5 text-white/90"
                                    />
                                    <span className="text-[10px] text-white/90 font-medium">
                                        {model.likes || 0}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <FontAwesomeIcon
                                        icon={faEye}
                                        className="w-2.5 h-2.5 text-white/90"
                                    />
                                    <span className="text-[10px] text-white/90 font-medium">
                                        {model.views || 0}
                                    </span>
                                </div>
                            </div>
                            <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                                <FontAwesomeIcon
                                    icon={faChevronRight}
                                    className="w-2.5 h-2.5 text-white"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Subtle border glow on hover */}
                <div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-white/20 transition-colors duration-300 pointer-events-none"></div>
            </article>
        </div>
    );
};

// Dynamic tabs based on user data
const getTabs = (user: UserProfileValues): Tab[] => [
    { id: "uploads", label: "Uploads", icon: "faImages", count: user.stats.uploadsCount },
    { id: "likes", label: "Likes", icon: "faHeart", count: user.stats.likesCount },
    { id: "stats", label: "Stats", icon: "faChartLine" },
    {
        id: "collections",
        label: "Collections",
        icon: "faBookmark",
        count: user.stats.collectionsCount,
    },
    { id: "achievements", label: "Achievements", icon: "faTrophy" },
];

interface ProfileSettingsPanelProps {
    user: UserProfileValues;
}

export const ProfileSettingsPanel = ({ user }: ProfileSettingsPanelProps) => {
    const [activeTab, setActiveTab] = useState<string>("uploads");
    const [loading, setLoading] = useState(false);

    // Fetch user's models using the real API
    const { data: modelsData, isLoading: modelsLoading } = useFetchModels({
        uploaderId: user.uid, // Filter by user's models
        limit: 12, // Limit for carousel
    });

    // Get real models from the query result
    const userModels = modelsData?.pages.flatMap((page) => page.models) ?? [];

    // Get tabs with real user data
    const tabs = getTabs(user);

    // Simulate loading state
    const handleTabChange = (tabId: string) => {
        setLoading(true);
        setTimeout(() => {
            setActiveTab(tabId);
            setLoading(false);
        }, 300);
    };

    const renderTabContent = () => {
        if (loading) {
            return (
                <div className="flex justify-center py-20">
                    <Spinner size={32} />
                </div>
            );
        }

        switch (activeTab) {
            case "uploads":
                return (
                    <div className="bg-bg-surface rounded-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold text-txt-primary">
                                My Uploads ({user.stats.uploadsCount})
                            </h3>
                            <Link
                                to="/upload"
                                className="text-sm bg-accent hover:bg-accent-hover text-white px-3 py-1 rounded-md transition-colors"
                            >
                                Upload New
                            </Link>
                        </div>
                        <p className="text-txt-secondary mb-6">
                            Manage your uploaded models. Here you can edit, delete, or
                            change privacy settings.
                        </p>

                        {/* Models Carousel */}
                        <div className="mt-4">
                            {modelsLoading ? (
                                <div className="flex justify-center py-8">
                                    <Spinner size={24} />
                                </div>
                            ) : userModels.length > 0 ? (
                                <ReusableCarousel<ModelData>
                                    items={userModels}
                                    renderItem={(model, idx) => (
                                        <ModelCarouselCard
                                            model={model}
                                            priority={idx < 6}
                                        />
                                    )}
                                    slidesToShow={6} // Show more cards (smaller width)
                                    slidesToScroll={3} // Scroll fewer at a time
                                    infinite={false}
                                    speed={500}
                                    responsive={[
                                        {
                                            breakpoint: 1024,
                                            settings: {
                                                slidesToShow: 4,
                                                slidesToScroll: 2,
                                            },
                                        },
                                        {
                                            breakpoint: 768,
                                            settings: {
                                                slidesToShow: 3,
                                                slidesToScroll: 2,
                                            },
                                        },
                                        {
                                            breakpoint: 480,
                                            settings: {
                                                slidesToShow: 2,
                                                slidesToScroll: 1,
                                            },
                                        },
                                    ]}
                                    containerClassName="px-2"
                                />
                            ) : (
                                <div className="text-center py-8 text-txt-secondary">
                                    <p>No models uploaded yet.</p>
                                    <Link
                                        to="/upload"
                                        className="inline-block mt-2 text-accent hover:text-accent-hover"
                                    >
                                        Upload your first model →
                                    </Link>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-center mt-6">
                            <Link
                                to="/models/my-uploads"
                                className="text-accent hover:text-accent-hover text-sm font-medium"
                            >
                                View All Uploads →
                            </Link>
                        </div>
                    </div>
                );
            case "likes":
                return (
                    <div className="bg-bg-surface rounded-lg p-6">
                        <h3 className="text-xl font-semibold text-txt-primary mb-4">
                            Liked Models ({user.stats.likesCount})
                        </h3>
                        <p className="text-txt-secondary mb-6">
                            Your liked models. Organize them into collections or remove
                            likes you no longer want.
                        </p>

                        {/* Liked Models Carousel */}
                        <div className="mt-4">
                            <div className="text-center py-8 text-txt-secondary">
                                <p>Liked models feature coming soon!</p>
                                <p className="text-sm mt-2">
                                    Your liked models will be displayed here.
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-center mt-6">
                            <Link
                                to="/models/liked"
                                className="text-accent hover:text-accent-hover text-sm font-medium"
                            >
                                View All Liked Models →
                            </Link>
                        </div>
                    </div>
                );
            case "stats":
                return (
                    <div className="bg-bg-surface rounded-lg p-6">
                        <h3 className="text-xl font-semibold text-txt-primary mb-4">
                            Private Statistics
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="text-center p-3 bg-bg-secondary rounded">
                                <div className="text-lg font-bold text-txt-primary">
                                    {user.stats.viewsCount}
                                </div>
                                <div className="text-xs text-txt-secondary">
                                    Total Views
                                </div>
                            </div>
                            <div className="text-center p-3 bg-bg-secondary rounded">
                                <div className="text-lg font-bold text-txt-primary">
                                    {user.stats.followers}
                                </div>
                                <div className="text-xs text-txt-secondary">
                                    Followers
                                </div>
                            </div>
                            <div className="text-center p-3 bg-bg-secondary rounded">
                                <div className="text-lg font-bold text-txt-primary">
                                    {user.stats.following}
                                </div>
                                <div className="text-xs text-txt-secondary">
                                    Following
                                </div>
                            </div>
                            <div className="text-center p-3 bg-bg-secondary rounded">
                                <div className="text-lg font-bold text-txt-primary">
                                    {user.isPremium ? "Premium" : "Free"}
                                </div>
                                <div className="text-xs text-txt-secondary">Account</div>
                            </div>
                        </div>
                        <p className="text-txt-secondary">
                            Detailed analytics and insights about your profile
                            performance.
                        </p>
                    </div>
                );
            case "collections":
                return (
                    <div className="bg-bg-surface rounded-lg p-6">
                        <h3 className="text-xl font-semibold text-txt-primary mb-4">
                            Collections ({user.stats.collectionsCount})
                        </h3>
                        <p className="text-txt-secondary">
                            Manage your {user.stats.collectionsCount} collections. Create
                            new collections, organize models, and set privacy settings.
                        </p>
                    </div>
                );
            case "achievements":
                return (
                    <div className="bg-bg-surface rounded-lg p-6">
                        <h3 className="text-xl font-semibold text-txt-primary mb-4">
                            Achievements
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="bg-bg-secondary rounded-lg p-4 border border-br-secondary">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                                        <FontAwesomeIcon
                                            icon={faTrophy}
                                            className="text-white"
                                        />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-txt-primary">
                                            First Upload
                                        </h4>
                                        <p className="text-sm text-txt-secondary">
                                            Uploaded your first model
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-bg-secondary rounded-lg p-4 border border-br-secondary">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                                        <FontAwesomeIcon
                                            icon={faHeart}
                                            className="text-white"
                                        />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-txt-primary">
                                            Popular Creator
                                        </h4>
                                        <p className="text-sm text-txt-secondary">
                                            Reached 1000+ likes
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-bg-secondary rounded-lg p-4 border border-br-secondary">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                                        <FontAwesomeIcon
                                            icon={faUser}
                                            className="text-white"
                                        />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-txt-primary">
                                            Community Member
                                        </h4>
                                        <p className="text-sm text-txt-secondary">
                                            Active for 1+ year
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="bg-bg-surface rounded-lg p-6">
                        <h3 className="text-xl font-semibold text-txt-primary mb-4">
                            My Uploads ({user.stats.uploadsCount})
                        </h3>
                        <p className="text-txt-secondary">
                            Manage your {user.stats.uploadsCount} uploaded models. Here
                            you can edit, delete, or change privacy settings.
                        </p>
                    </div>
                );
        }
    };

    const getIconComponent = (iconName: string): IconDefinition => {
        const iconMap: Record<string, IconDefinition> = {
            faImages,
            faHeart,
            faChartLine,
            faUser,
            faBookmark,
            faTrophy,
        };
        return iconMap[iconName] || faUser;
    };

    return (
        <div className="bg-bg-secondary rounded-lg p-6 shadow-md">
            {/* Settings Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-txt-primary">
                        Profile Management
                    </h2>
                    <p className="text-sm text-txt-secondary">
                        Welcome back, {user.displayName}!
                    </p>
                </div>
                <Link
                    to={ROUTES.USER_SETTINGS}
                    className="flex items-center space-x-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg transition-all duration-200"
                >
                    <FontAwesomeIcon icon={faCog} className="w-4 h-4" />
                    <span>Settings</span>
                </Link>
            </div>

            {/* Tabs Navigation */}
            <div className="border-b border-br-secondary mb-6">
                <nav className="flex space-x-8 overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                                activeTab === tab.id
                                    ? "border-accent text-accent"
                                    : "border-transparent text-txt-secondary hover:text-txt-primary hover:border-br-secondary"
                            }`}
                        >
                            <FontAwesomeIcon
                                icon={getIconComponent(tab.icon)}
                                className="w-4 h-4"
                            />
                            <span>{tab.label}</span>
                            {tab.count && (
                                <span className="bg-bg-surface text-txt-secondary text-xs px-2 py-1 rounded-full">
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div>{renderTabContent()}</div>
        </div>
    );
};
