import { useState } from "react";
import { useAuth } from "../../../contexts/authContext";

export const ProfileSettings = () => {
    const { currentUser } = useAuth();
    const [activeTab, setActiveTab] = useState("account");

    const tabs = [
        { id: "account", label: "Account" },
        { id: "notifications", label: "Notifications" },
        { id: "security", label: "Security" },
        { id: "bio", label: "Bio" }
    ];

    return (
        <div className="max-w-6xl mx-auto p-4 flex space-x-6">
            {/* Sidebar */}
            <aside className="w-1/4 p-4 bg-bg-surface shadow-md rounded-lg">
                <div className="flex flex-col items-center text-center">
                    <img
                        src={currentUser?.photoURL || "/default-avatar.png"}
                        alt="User Avatar"
                        className="w-24 h-24 rounded-full border-2 border-br-primary"
                    />
                    <h2 className="mt-2 text-lg font-semibold text-txt-primary">
                        {currentUser?.displayName || "Anonymous"}
                    </h2>
                </div>
                
                <nav className="mt-6">
                    <ul className="space-y-2">
                        {tabs.map(tab => (
                            <li key={tab.id}>
                                <button
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full text-left px-4 py-2 rounded-md font-medium ${
                                        activeTab === tab.id
                                            ? "bg-accent text-txt-highlighted"
                                            : "text-txt-secondary hover:bg-bg-secondary hover:text-txt-highlighted"
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>
            
            {/* Main Content */}
            <section className="w-3/4 p-6 bg-bg-surface shadow-md rounded-lg">
                {activeTab === "account" && <AccountSettings />}
                {activeTab === "notifications" && <NotificationSettings />}
                {activeTab === "security" && <SecuritySettings />}
                {activeTab === "bio" && <BioSettings />}
            </section>
        </div>
    );
};

const AccountSettings = () => (
    <div>
        <h2 className="text-xl font-semibold text-txt-primary">Account Settings</h2>
        <p className="text-txt-secondary mt-2">Manage your personal details.</p>
        {/* Form Fields Here */}
    </div>
);

const NotificationSettings = () => (
    <div>
        <h2 className="text-xl font-semibold text-txt-primary">Notification Preferences</h2>
        <p className="text-txt-secondary mt-2">Choose what notifications you receive.</p>
        {/* Settings Fields Here */}
    </div>
);

const SecuritySettings = () => (
    <div>
        <h2 className="text-xl font-semibold text-txt-primary">Security Settings</h2>
        <p className="text-txt-secondary mt-2">Change password, enable two-factor authentication.</p>
        {/* Security Fields Here */}
    </div>
);

const BioSettings = () => (
    <div>
        <h2 className="text-xl font-semibold text-txt-primary">Bio & Interests</h2>
        <p className="text-txt-secondary mt-2">Update your bio and interests.</p>
        {/* Bio Fields Here */}
    </div>
);
