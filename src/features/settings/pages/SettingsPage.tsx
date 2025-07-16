import { useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { AccountSettings } from "@/features/settings/components/AccountSettings";
import { SecuritySettings } from "@/features/settings/components/SecuritySettings";
import { ProfileSettings } from "@/features/settings/components/ProfileSettings";

type Tab = {
    id: string;
    label: string;
};

export const SettingsPage = () => {
    const { currentUser } = useAuth();
    const [activeTab, setActiveTab] = useState<string>("profile");

    const tabs: Tab[] = [
        { id: "profile", label: "Profile" },
        { id: "account", label: "Account" },
        { id: "notifications", label: "Notifications" },
        { id: "security", label: "Security" },
    ];

    return (
        <div className="max-w-7xl mx-auto min-h-[800px] p-4 flex gap-4 md:flex-row flex-col">
            {/* Sidebar */}
            <aside className="md:w-1/4 p-4 bg-bg-surface shadow-md rounded-lg">
                <div className="flex md:flex-col flex-row md:gap-1 gap-5 justify-center items-center text-center">
                    <img
                        src={currentUser?.photoURL || "/user.png"}
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
                                    className={`w-full text-left px-4 py-2 rounded-md font-medium ${
                                        activeTab === tab.id
                                            ? "bg-accent text-white"
                                            : "text-txt-secondary hover:bg-bg-secondary hover:text-txt-primary"
                                    }`}
                                    type="button"
                                >
                                    {tab.label}
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
                {/* {activeTab === "notifications" && <NotificationSettings />} */}
                {activeTab === "security" && <SecuritySettings />}
            </section>
        </div>
    );
};
