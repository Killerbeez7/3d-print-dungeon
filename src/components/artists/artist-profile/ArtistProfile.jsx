import { useState, useEffect } from "react";
import { useParams } from "react-router-dom"; // To access URL params
import { getUserFromDatabase } from "../../../services/authService"; // The function to get user data
import { useModels } from "../../../contexts/modelsContext";
import { UploadsSection } from "./UploadsSection";
import { LikesSection } from "./LikesSection";
import { AboutSection } from "./AboutSection";

export const ArtistProfile = () => {
    const { uid } = useParams(); // Get UID from the URL
    const { models, loading: modelsLoading } = useModels();
    const [userData, setUserData] = useState(null);
    const [userUploads, setUserUploads] = useState([]);
    const [activeTab, setActiveTab] = useState("uploads");

    const tabs = [
        { id: "uploads", label: "Uploads" },
        { id: "likes", label: "Likes" },
        { id: "about", label: "About" }
    ];

    // Fetch user data based on UID
    useEffect(() => {
        const fetchUserData = async () => {
            getUserFromDatabase(uid, (data) => {
                setUserData(data);
            });
        };

        fetchUserData();
    }, [uid]);

    // Fetch the user's uploads from models
    useEffect(() => {
        if (!userData || modelsLoading) return;

        // Use the UID directly here instead of userData.uid
        const userModels = models.filter((model) => model.uploaderId === uid); // `uid` is the document ID
        setUserUploads(userModels);
    }, [models, userData, modelsLoading, uid]);

    if (!userData) {
        return <div className="text-center">Loading user profile...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto p-4">
            {/* Profile Header */}
            <div className="flex items-center space-x-4 p-6 bg-bg-surface shadow-md rounded-lg">
                <img
                    src={userData?.photoURL || "/user.png"}
                    alt="User Avatar"
                    className="w-20 h-20 rounded-full border-2 border-br-primary"
                />
                <div>
                    <h1 className="text-2xl font-semibold text-txt-primary">
                        {userData?.displayName || "Anonymous"}
                    </h1>
                    <p className="text-txt-secondary">{userData?.bio || "No bio available"}</p>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex mt-6 border-b border-br-primary">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 font-medium text-lg ${
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
            <div className="mt-6">
                {activeTab === "uploads" && <UploadsSection artworks={userUploads} />}
                {activeTab === "likes" && <LikesSection />}
                {activeTab === "about" && <AboutSection />}
            </div>
        </div>
    );
};
