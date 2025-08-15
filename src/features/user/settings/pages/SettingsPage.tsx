import { useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getAvatarUrlWithCacheBust } from "@/utils/avatarUtils";
import { AccountSettings } from "@/features/user/settings/components/AccountSettings";
import { SecuritySettings } from "@/features/user/settings/components/SecuritySettings";
import { ProfileSettings } from "@/features/user/settings/components/ProfileSettings";
import { NotificationSettings } from "@/features/user/settings/components/NotificationSettings";
import { PrivacySettings } from "@/features/user/settings/components/PrivacySettings";

type Tab = {
    id: string;
    label: string;
    icon: string;
};

export const SettingsPage = () => {
    const { currentUser, publicProfile } = useAuth();
    const [activeTab, setActiveTab] = useState<string>("profile");

    const avatarUrl = getAvatarUrlWithCacheBust(publicProfile?.photoURL || currentUser?.photoURL);

    const tabs: Tab[] = [
        { id: "profile", label: "Profile", icon: "fas fa-user" },
        { id: "account", label: "Account", icon: "fas fa-cog" },
        { id: "notifications", label: "Notifications", icon: "fas fa-bell" },
        { id: "privacy", label: "Privacy", icon: "fas fa-lock" },
        { id: "security", label: "Security", icon: "fas fa-shield-alt" },
    ];

    return (
        <div className="max-w-7xl mx-auto min-h-[800px] p-4 flex gap-4 md:flex-row flex-col">
            {/* Sidebar */}
            <aside className="md:w-1/4 p-4 bg-bg-surface shadow-md rounded-lg">
                <div className="flex md:flex-col flex-row md:gap-1 gap-5 justify-center items-center text-center">
                    <img
                        src={avatarUrl}
                        alt="User avatar"
                        className="w-24 h-24 rounded-full border-2 border-br-primary object-cover"
                    />
                    <div>
                        <h2 className="mt-2 text-lg font-semibold text-txt-primary">
                            {publicProfile?.displayName || currentUser?.displayName || "Anonymous"}
                        </h2>
                        <p className="text-sm text-txt-secondary">
                            {currentUser?.email || "No email"}
                        </p>
                    </div>
                </div>
                <nav className="mt-6">
                    <ul className="space-y-2">
                        {tabs.map((tab) => (
                            <li key={tab.id}>
                                <button
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full text-left px-4 py-3 rounded-md font-medium transition-colors ${
                                        activeTab === tab.id
                                            ? "bg-accent text-white shadow-sm"
                                            : "text-txt-secondary hover:bg-bg-secondary hover:text-txt-primary"
                                    }`}
                                    type="button"
                                >
                                    <div className="flex items-center gap-3">
                                        <i className={`${tab.icon} text-lg`}></i>
                                        <span>{tab.label}</span>
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>
            
            {/* Main Content */}
            <section className="md:w-3/4 p-6 bg-bg-surface shadow-md rounded-lg flex-grow">
                {activeTab === "profile" && <ProfileSettings />}
                {activeTab === "account" && <AccountSettings />}
                {activeTab === "notifications" && <NotificationSettings />}
                {activeTab === "privacy" && <PrivacySettings />}
                {activeTab === "security" && <SecuritySettings />}
            </section>
        </div>
    );
};
