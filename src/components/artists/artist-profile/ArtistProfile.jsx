import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserFromDatabase } from "../../../services/authService";
import { UploadsSection } from "./UploadsSection";
import { LikesSection } from "./LikesSection";
import { AboutSection } from "./AboutSection";

export const ArtistProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [activeTab, setActiveTab] = useState("uploads");
    const [error, setError] = useState(null);

    const tabs = [
        { id: "uploads", label: "Uploads" },
        { id: "likes", label: "Likes" },
        { id: "about", label: "About" },
    ];

    // Fetch user data based on ID
    useEffect(() => {
        if (!id) {
            setError("No user ID provided");
            return;
        }

        const unsubscribe = getUserFromDatabase(id, (data) => {
            if (data) {
                setUserData(data);
                setError(null);
            } else {
                setError("User not found");
                setUserData(null);
            }
        });

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [id]);

    if (error) {
        return (
            <div className="text-center p-8">
                <h2 className="text-2xl font-semibold text-txt-primary mb-4">{error}</h2>
                <button
                    onClick={() => navigate(-1)}
                    className="text-accent hover:text-accent-hover"
                >
                    Go Back
                </button>
            </div>
        );
    }

    if (!userData) {
        return <div className="text-center p-8">Loading user profile...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto p-2 sm:p-4">
            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 p-4 sm:p-6 bg-bg-surface shadow-md rounded-lg">
                <img
                    src={userData?.photoURL || "/user.png"}
                    alt="User Avatar"
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-br-primary mx-auto sm:mx-0"
                />
                <div className="text-center sm:text-left">
                    <h1 className="text-xl sm:text-2xl font-semibold text-txt-primary">
                        {userData?.displayName || "Anonymous"}
                    </h1>
                    <p className="text-sm sm:text-base text-txt-secondary">
                        {userData?.bio || "No bio available"}
                    </p>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex mt-6 border-b border-br-primary overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-3 sm:px-4 py-2 font-medium text-base sm:text-lg whitespace-nowrap ${
                            activeTab === tab.id
                                ? "border-b-2 border-accent text-txt-primary"
                                : "text-txt-secondary hover:text-txt-highlighted"
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Section */}
            <div className="mt-4 sm:mt-6">
                {activeTab === "uploads" && <UploadsSection userId={id} />}
                {activeTab === "likes" && <LikesSection userId={id} />}
                {activeTab === "about" && <AboutSection userData={userData} />}
            </div>
        </div>
    );
};
