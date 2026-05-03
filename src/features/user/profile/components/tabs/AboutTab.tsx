import type { PublicProfileView } from "@/features/user/types/user";
import { 
    Twitter, 
    Instagram, 
    Facebook, 
    Globe,
    ExternalLink
} from "lucide-react";

interface UserData extends PublicProfileView {
    bio?: string;
    location?: string;
    website?: string;
    joinDate?: string;
    lastActive?: string;
    badges?: string[];
    socialLinks?: {
        twitter?: string;
        instagram?: string;
        facebook?: string;
    };
}

// Social media platform configuration (same as UserHeader for consistency)
const socialPlatforms = [
    {
        key: 'twitter',
        name: 'Twitter',
        icon: Twitter,
        color: 'hover:bg-blue-500/10 hover:text-blue-500 hover:border-blue-500/20',
        bgColor: 'bg-blue-500/5',
        borderColor: 'border-blue-500/20',
        textColor: 'text-blue-500'
    },
    {
        key: 'instagram',
        name: 'Instagram',
        icon: Instagram,
        color: 'hover:bg-pink-500/10 hover:text-pink-500 hover:border-pink-500/20',
        bgColor: 'bg-pink-500/5',
        borderColor: 'border-pink-500/20',
        textColor: 'text-pink-500'
    },
    {
        key: 'facebook',
        name: 'Facebook',
        icon: Facebook,
        color: 'hover:bg-blue-600/10 hover:text-blue-600 hover:border-blue-600/20',
        bgColor: 'bg-blue-600/5',
        borderColor: 'border-blue-600/20',
        textColor: 'text-blue-600'
    },

    {
        key: 'website',
        name: 'Website',
        icon: Globe,
        color: 'hover:bg-accent-soft hover:text-accent-text hover:border-accent/25',
        bgColor: 'bg-accent-soft',
        borderColor: 'border-accent/25',
        textColor: 'text-accent-text'
    }
];

export const AboutTab = ({ userData }: { userData: UserData }) => {
    // Get available social links
    const availableSocialLinks = socialPlatforms.filter(platform => {
        if (platform.key === 'website') {
            return userData.website;
        }
        return userData.socialLinks?.[platform.key as keyof typeof userData.socialLinks];
    });

    const hasAnySocialLinks = availableSocialLinks.length > 0;

    return (
        <div className="space-y-8">
            {/* Bio Section */}
            <div className="bg-bg-secondary rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                        <i className="fas fa-user text-white text-sm"></i>
                    </div>
                    <h3 className="text-xl font-semibold text-txt-primary">About Me</h3>
                </div>
                <p className="text-txt-secondary text-lg leading-relaxed">
                    {userData?.bio ||
                        "This user hasn't added a bio yet. Check back later to learn more about them!"}
                </p>
            </div>

            {/* Personal Information */}
            <div className="bg-bg-secondary rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center">
                        <i className="fas fa-info text-white text-sm"></i>
                    </div>
                    <h3 className="text-xl font-semibold text-txt-primary">
                        Personal Information
                    </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userData?.location && (
                        <div className="flex items-center gap-3 p-3 bg-bg-surface rounded-lg">
                            <i className="fas fa-map-marker-alt text-accent"></i>
                            <div>
                                <div className="text-sm text-txt-secondary">Location</div>
                                <div className="text-txt-primary font-medium">
                                    {userData.location}
                                </div>
                            </div>
                        </div>
                    )}
                    {userData?.website && (
                        <div className="flex items-center gap-3 p-3 bg-bg-surface rounded-lg">
                            <i className="fas fa-globe text-accent"></i>
                            <div>
                                <div className="text-sm text-txt-secondary">Website</div>
                                <a
                                    href={userData.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-txt-primary font-medium hover:text-accent transition-colors"
                                >
                                    {userData.website}
                                </a>
                            </div>
                        </div>
                    )}
                    {userData?.joinDate && (
                        <div className="flex items-center gap-3 p-3 bg-bg-surface rounded-lg">
                            <i className="fas fa-calendar-alt text-accent"></i>
                            <div>
                                <div className="text-sm text-txt-secondary">
                                    Member Since
                                </div>
                                <div className="text-txt-primary font-medium">
                                    {new Date(userData.joinDate).toLocaleDateString(
                                        "en-US",
                                        {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        }
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                    {userData?.lastActive && (
                        <div className="flex items-center gap-3 p-3 bg-bg-surface rounded-lg">
                            <i className="fas fa-clock text-accent"></i>
                            <div>
                                <div className="text-sm text-txt-secondary">
                                    Last Active
                                </div>
                                <div className="text-txt-primary font-medium">
                                    {new Date(userData.lastActive).toLocaleDateString(
                                        "en-US",
                                        {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                        }
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Social Links Section - Beautiful UI with Icons */}
            {hasAnySocialLinks && (
                <div className="bg-bg-secondary rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                            <i className="fas fa-share-alt text-white text-sm"></i>
                        </div>
                        <h3 className="text-xl font-semibold text-txt-primary">
                            Connect & Follow
                        </h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {availableSocialLinks.map((platform) => {
                            const IconComponent = platform.icon;
                            const url = platform.key === 'website' 
                                ? userData.website 
                                : userData.socialLinks?.[platform.key as keyof typeof userData.socialLinks];
                            
                            if (!url) return null;

                            return (
                                <a
                                    key={platform.key}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`
                                        group relative flex flex-col items-center gap-3 p-4 
                                        rounded-lg border transition-all duration-200 
                                        ${platform.bgColor} ${platform.borderColor} 
                                        ${platform.color}
                                        hover:scale-105 hover:shadow-md
                                    `}
                                    title={`Visit ${platform.name}`}
                                >
                                    {IconComponent && (
                                        <IconComponent 
                                            className={`w-6 h-6 ${platform.textColor} transition-colors`} 
                                        />
                                    )}
                                    <span className="text-sm font-medium text-txt-secondary group-hover:text-txt-primary transition-colors text-center">
                                        {platform.name}
                                    </span>
                                    <ExternalLink className="w-3 h-3 text-txt-tertiary opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2" />
                                </a>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Skills & Interests */}
            <div className="bg-bg-secondary rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                        <i className="fas fa-tools text-white text-sm"></i>
                    </div>
                    <h3 className="text-xl font-semibold text-txt-primary">
                        Skills & Interests
                    </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                    {[
                        "3D Modeling",
                        "Texturing",
                        "Rigging",
                        "Animation",
                        "Sculpting",
                        "Rendering",
                        "Game Art",
                        "Character Design",
                        "Environment Design",
                        "Concept Art",
                    ].map((skill, index) => (
                        <span
                            key={index}
                            className="px-3 py-1 bg-accent bg-opacity-20 text-accent rounded-full text-sm font-medium"
                        >
                            {skill}
                        </span>
                    ))}
                </div>
            </div>

            {/* Badges & Achievements */}
            {userData?.badges && userData.badges.length > 0 && (
                <div className="bg-bg-secondary rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                            <i className="fas fa-trophy text-white text-sm"></i>
                        </div>
                        <h3 className="text-xl font-semibold text-txt-primary">
                            Badges & Achievements
                        </h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {userData.badges.map((badge, index) => (
                            <div
                                key={index}
                                className="flex flex-col items-center gap-2 p-4 bg-bg-surface rounded-lg"
                            >
                                <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                                    <i className="fas fa-medal text-white text-lg"></i>
                                </div>
                                <span className="text-sm font-medium text-txt-primary text-center">
                                    {badge}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}


        </div>
    );
};
