import { useState, useEffect } from "react";
import { Tab } from "@headlessui/react";
import { UserManagement } from "./tabs/UserManagement";
import { ContentModeration } from "./tabs/ContentModeration";
import { SiteSettings } from "./tabs/SiteSettings";
import { Analytics } from "./tabs/Analytics";
import { MaintenanceSettings } from "./tabs/MaintenanceSettings";
import { useAuth } from "../../contexts/authContext";
import { Navigate } from "react-router-dom";
import { isAdmin } from "../../services/adminService";

function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
}

export const AdminPanel = () => {
    const { currentUser } = useAuth();
    const [selectedTab, setSelectedTab] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isAdminUser, setIsAdminUser] = useState(false);

    useEffect(() => {
        const checkAdminStatus = async () => {
            if (!currentUser) {
                setLoading(false);
                return;
            }
            try {
                const adminStatus = await isAdmin(currentUser.uid);
                setIsAdminUser(adminStatus);
            } catch (error) {
                console.error("Error checking admin status:", error);
            }
            setLoading(false);
        };

        checkAdminStatus();
    }, [currentUser]);

    if (loading) {
        return <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">Loading...</div>;
    }

    // Redirect if user is not logged in or not an admin
    if (!currentUser || !isAdminUser) {
        return <Navigate to="/" replace />;
    }

    const tabs = [
        { name: "User Management", component: UserManagement },
        { name: "Content Moderation", component: ContentModeration },
        { name: "Site Settings", component: SiteSettings },
        { name: "Analytics", component: Analytics },
        { name: "Maintenance", component: MaintenanceSettings },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <h1 className="text-2xl font-bold mb-8">Admin Panel</h1>
            
            <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
                <Tab.List className="flex space-x-2 rounded-xl bg-bg-surface p-1">
                    {tabs.map((tab) => (
                        <Tab
                            key={tab.name}
                            className={({ selected }) =>
                                classNames(
                                    "w-full rounded-lg py-2.5 text-sm font-medium leading-5",
                                    "ring-white ring-opacity-60 ring-offset-2 focus:outline-none focus:ring-2",
                                    selected
                                        ? "bg-accent text-white shadow"
                                        : "text-txt-secondary hover:bg-bg-secondary hover:text-txt-primary"
                                )
                            }
                        >
                            {tab.name}
                        </Tab>
                    ))}
                </Tab.List>
                <Tab.Panels className="mt-4">
                    {tabs.map((tab, idx) => (
                        <Tab.Panel
                            key={idx}
                            className={classNames(
                                "rounded-xl bg-bg-surface p-6",
                                "ring-white ring-opacity-60 ring-offset-2 focus:outline-none focus:ring-2"
                            )}
                        >
                            <tab.component />
                        </Tab.Panel>
                    ))}
                </Tab.Panels>
            </Tab.Group>
        </div>
    );
};
