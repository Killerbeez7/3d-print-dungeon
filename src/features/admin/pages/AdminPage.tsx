import { useState } from "react";
import { Tab } from "@headlessui/react";
import { UserManagement } from "../components/UserManagement";
import { ContentModeration } from "../components/ContentModeration";
import { SiteSettings } from "../components/SiteSettings";
import { Analytics } from "../components/Analytics";
import { MaintenanceSettings } from "../components/MaintenanceSettings";
import { Scripts } from "../components/Scripts";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Spinner } from "@/features/shared/reusable/Spinner";

function classNames(...classes: (string | undefined | null | false)[]): string {
    return classes.filter(Boolean).join(" ");
}

interface TabConfig {
    name: string;
    component: React.ComponentType;
}

export const AdminPage = () => {
    const { currentUser, isAdmin, loading } = useAuth();
    const [selectedTab, setSelectedTab] = useState<number>(0);

    if (loading) {
        return <Spinner size={24} />;
    }

    if (!currentUser || !isAdmin) {
        return <Navigate to="/" replace />;
    }

    const tabs: TabConfig[] = [
        { name: "User Management", component: UserManagement },
        { name: "Content Moderation", component: ContentModeration },
        { name: "Site Settings", component: SiteSettings },
        { name: "Analytics", component: Analytics },
        { name: "Maintenance", component: MaintenanceSettings },
        { name: "Scripts", component: Scripts },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <h1 className="text-2xl font-bold mb-8">Admin Panel</h1>
            <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
                <Tab.List className="flex space-x-2 rounded-xl bg-bg-surface p-1">
                    {tabs.map((tab) => (
                        <Tab
                            key={tab.name}
                            className={({ selected }: { selected: boolean }) =>
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
