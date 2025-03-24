import { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/authContext";
import { useModels } from "../../../contexts/modelsContext";
import { UploadsSection } from "./UploadsSection";
import { LikesSection } from "./LikesSection";
import { AboutSection } from "./AboutSection";

export const Profile = () => {
    const { currentUser } = useAuth();
    const { models, loading: modelsLoading } = useModels();
    const [activeTab, setActiveTab] = useState("uploads");
    const [userUploads, setUserUploads] = useState([]);

    const tabs = [
        { id: "uploads", label: "Uploads" },
        { id: "likes", label: "Likes" },
        { id: "about", label: "About" }
    ];

    // Fetch the user's uploads from models
    useEffect(() => {
        if (!currentUser) return;

        const userModels = models.filter(model => model.uploaderId === currentUser.uid);
        setUserUploads(userModels);
    }, [models, currentUser]);

    if (!currentUser) {
        return <div className="text-center">Please log in to view your profile.</div>;
    }

    if (modelsLoading) {
        return <div className="text-center">Loading your models...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto p-4">
            {/* Profile Header */}
            <div className="flex items-center space-x-4 p-6 bg-bg-surface shadow-md rounded-lg">
                <img
                    src={currentUser?.photoURL || "/user.png"}
                    alt="User Avatar"
                    className="w-20 h-20 rounded-full border-2 border-br-primary"
                />
                <div>
                    <h1 className="text-2xl font-semibold text-txt-primary">
                        {currentUser?.displayName || "Anonymous"}
                    </h1>
                    <p className="text-txt-secondary">{currentUser?.bio || "No bio available"}</p>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex mt-6 border-b border-br-primary">
                {tabs.map(tab => (
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
