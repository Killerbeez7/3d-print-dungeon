import { useAuth } from "../../../contexts/authContext";

export const AboutSection = () => {
    const { currentUser } = useAuth();

    return (
        <div className="bg-bg-surface p-8 rounded-lg shadow-md mt-8 max-w-6xl mx-auto">
            {/* Bio Section */}
            <div className="space-y-4">
                <h3 className="text-2xl font-semibold text-txt-primary">About Me</h3>
                <p className="text-txt-secondary text-lg">{currentUser?.bio || "This user has not updated their bio yet."}</p>
            </div>

            {/* Social Links Section */}
            <div className="mt-8">
                <h3 className="text-2xl font-semibold text-txt-primary">Connect with Me</h3>
                <div className="flex space-x-6 mt-3">
                    {currentUser?.socialLinks?.twitter && (
                        <a
                            href={currentUser?.socialLinks?.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-twitter hover:text-twitter-dark transition-colors"
                            title="Twitter"
                        >
                            <i className="fab fa-twitter text-2xl"></i>
                        </a>
                    )}
                    {currentUser?.socialLinks?.instagram && (
                        <a
                            href={currentUser?.socialLinks?.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-instagram hover:text-instagram-dark transition-colors"
                            title="Instagram"
                        >
                            <i className="fab fa-instagram text-2xl"></i>
                        </a>
                    )}
                    {currentUser?.socialLinks?.website && (
                        <a
                            href={currentUser?.socialLinks?.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-txt-primary hover:text-txt-highlighted transition-colors"
                            title="Website"
                        >
                            <i className="fas fa-globe text-2xl"></i>
                        </a>
                    )}
                    {/* Add more social links as necessary */}
                </div>
            </div>

            {/* Additional Info Section */}
            <div className="mt-8">
                <h3 className="text-2xl font-semibold text-txt-primary">Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    {currentUser?.location && (
                        <div className="flex items-center text-lg text-txt-secondary">
                            <i className="fas fa-map-marker-alt mr-2"></i>
                            <span>{currentUser?.location}</span>
                        </div>
                    )}
                    {currentUser?.website && (
                        <div className="flex items-center text-lg text-txt-secondary">
                            <i className="fas fa-link mr-2"></i>
                            <a
                                href={currentUser?.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-txt-primary hover:text-txt-highlighted"
                            >
                                {currentUser?.website}
                            </a>
                        </div>
                    )}
                    {/* Additional Info like skills, interests, etc., can be added here */}
                </div>
            </div>
        </div>
    );
};
