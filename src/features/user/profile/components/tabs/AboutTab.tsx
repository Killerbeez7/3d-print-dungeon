import type { ProfileUserData } from "../../types/profile";

interface UserData extends ProfileUserData {
    bio?: string;
    location?: string;
    website?: string;
    socialLinks?: {
        twitter?: string;
        instagram?: string;
        website?: string;
        linkedin?: string;
        facebook?: string;
        youtube?: string;
        twitch?: string;
        discord?: string;
        github?: string;
        behance?: string;
        artstation?: string;
    };
}

export const AboutTab = ({ userData }: { userData: UserData }) => {
    const socialLinks = [
        {
            name: "Twitter",
            icon: "fab fa-twitter",
            url: userData?.socialLinks?.twitter,
            color: "text-blue-400 hover:text-blue-500",
        },
        {
            name: "Instagram",
            icon: "fab fa-instagram",
            url: userData?.socialLinks?.instagram,
            color: "text-pink-400 hover:text-pink-500",
        },
        {
            name: "LinkedIn",
            icon: "fab fa-linkedin",
            url: userData?.socialLinks?.linkedin,
            color: "text-blue-600 hover:text-blue-700",
        },
        {
            name: "Facebook",
            icon: "fab fa-facebook",
            url: userData?.socialLinks?.facebook,
            color: "text-blue-600 hover:text-blue-700",
        },
        {
            name: "YouTube",
            icon: "fab fa-youtube",
            url: userData?.socialLinks?.youtube,
            color: "text-red-500 hover:text-red-600",
        },
        {
            name: "Twitch",
            icon: "fab fa-twitch",
            url: userData?.socialLinks?.twitch,
            color: "text-purple-500 hover:text-purple-600",
        },
        {
            name: "Discord",
            icon: "fab fa-discord",
            url: userData?.socialLinks?.discord,
            color: "text-indigo-500 hover:text-indigo-600",
        },
        {
            name: "GitHub",
            icon: "fab fa-github",
            url: userData?.socialLinks?.github,
            color: "text-gray-600 hover:text-gray-700",
        },
        {
            name: "Behance",
            icon: "fab fa-behance",
            url: userData?.socialLinks?.behance,
            color: "text-blue-600 hover:text-blue-700",
        },
        {
            name: "ArtStation",
            icon: "fas fa-palette",
            url: userData?.socialLinks?.artstation,
            color: "text-orange-500 hover:text-orange-600",
        },
    ];

    const hasAnySocialLinks = socialLinks.some(link => link.url);

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
                    {userData?.bio || "This user hasn't added a bio yet. Check back later to learn more about them!"}
                </p>
            </div>

            {/* Personal Information */}
            <div className="bg-bg-secondary rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <i className="fas fa-info text-white text-sm"></i>
                    </div>
                    <h3 className="text-xl font-semibold text-txt-primary">Personal Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userData?.location && (
                        <div className="flex items-center gap-3 p-3 bg-bg-surface rounded-lg">
                            <i className="fas fa-map-marker-alt text-accent"></i>
                            <div>
                                <div className="text-sm text-txt-secondary">Location</div>
                                <div className="text-txt-primary font-medium">{userData.location}</div>
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
                                <div className="text-sm text-txt-secondary">Member Since</div>
                                <div className="text-txt-primary font-medium">
                                    {new Date(userData.joinDate).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric"
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                    {userData?.lastActive && (
                        <div className="flex items-center gap-3 p-3 bg-bg-surface rounded-lg">
                            <i className="fas fa-clock text-accent"></i>
                            <div>
                                <div className="text-sm text-txt-secondary">Last Active</div>
                                <div className="text-txt-primary font-medium">
                                    {new Date(userData.lastActive).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric"
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Social Links Section */}
            {hasAnySocialLinks && (
                <div className="bg-bg-secondary rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                            <i className="fas fa-share-alt text-white text-sm"></i>
                        </div>
                        <h3 className="text-xl font-semibold text-txt-primary">Connect & Follow</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {socialLinks
                            .filter(link => link.url)
                            .map((link, index) => (
                                <a
                                    key={index}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`flex flex-col items-center gap-2 p-4 bg-bg-surface rounded-lg hover:shadow-md transition-all duration-200 ${link.color}`}
                                    title={link.name}
                                >
                                    <i className={`${link.icon} text-2xl`}></i>
                                    <span className="text-sm font-medium">{link.name}</span>
                                </a>
                            ))}
                    </div>
                </div>
            )}

            {/* Skills & Interests */}
            <div className="bg-bg-secondary rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                        <i className="fas fa-tools text-white text-sm"></i>
                    </div>
                    <h3 className="text-xl font-semibold text-txt-primary">Skills & Interests</h3>
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
                        "Concept Art"
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
                        <h3 className="text-xl font-semibold text-txt-primary">Badges & Achievements</h3>
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
                                <span className="text-sm font-medium text-txt-primary text-center">{badge}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Contact Information */}
            <div className="bg-bg-secondary rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <i className="fas fa-envelope text-white text-sm"></i>
                    </div>
                    <h3 className="text-xl font-semibold text-txt-primary">Get in Touch</h3>
                </div>
                <p className="text-txt-secondary mb-4">
                    Interested in collaborating or have questions? Feel free to reach out through any of the social links above or send a direct message.
                </p>
                <div className="flex gap-3">
                    <button className="cta-button px-6 py-3 rounded-lg flex items-center gap-2">
                        <i className="fas fa-envelope"></i>
                        Send Message
                    </button>
                    <button className="secondary-button px-6 py-3 rounded-lg flex items-center gap-2">
                        <i className="fas fa-share"></i>
                        Share Profile
                    </button>
                </div>
            </div>
        </div>
    );
};
