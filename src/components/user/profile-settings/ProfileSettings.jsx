import { useState } from "react";
import PropTypes from "prop-types";
import { useAuth } from "../../../contexts/authContext";
import { useTheme } from "../../../utils/theme";

export const ProfileSettings = () => {
    const { currentUser } = useAuth();
    const [activeTab, setActiveTab] = useState("account");

    const [theme, setTheme] = useTheme();

    const themes = [
        { id: "system", label: "OS Default" },
        { id: "light", label: "Light" },
        { id: "dark", label: "Dark" }
    ];

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
                        {tabs.map((tab) => (
                            <li key={tab.id}>
                                <button
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full text-left px-4 py-2 rounded-md font-medium ${activeTab === tab.id
                                            ? "bg-accent text-white"
                                            : "text-txt-secondary hover:bg-bg-secondary hover:text-txt-primary"
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
                {activeTab === "account" && <AccountSettings theme={theme} setTheme={setTheme} themes={themes} />}
                {activeTab === "notifications" && <NotificationSettings />}
                {activeTab === "security" && <SecuritySettings />}
                {activeTab === "bio" && <BioSettings />}
            </section>
        </div>
    );
};

const AccountSettings = ({ theme, setTheme, themes }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div>
            <h2 className="text-xl font-semibold text-txt-primary pb-2 border-b border-br-primary">
                Account Settings
            </h2>

            <div className="flex items-center justify-between mt-4">
                <p className="w-1/3 text-txt-secondary font-semibold">Theme Preference</p>

                <div className="relative w-2/3">
                    <div
                        className="relative cursor-pointer border border-br-primary px-2 py-2 text-txt-primary bg-bg-primary"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                    <span>{themes.find((t) => t.id === theme)?.label || "Select Theme"}</span>
                    </div>

                    {isOpen && (
                        <div className="absolute text-txt-secondary mt-1 bg-bg-primary w-full border border-br-primary shadow-md z-10">
                            {themes.map((t) => (
                                <button
                                    key={t.id}
                                    className="block w-full text-left px-2 py-2 hover:bg-bg-secondary hover:text-txt-primary hover:cursor-pointer transition"
                                    onClick={() => {
                                        setTheme(t.id);
                                        setIsOpen(false);
                                    }}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

AccountSettings.propTypes = {
    theme: PropTypes.string.isRequired,
    setTheme: PropTypes.func.isRequired,
    themes: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired
        })
    ).isRequired
};

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
