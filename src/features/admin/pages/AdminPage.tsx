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
    return (
      <div className="flex justify-center py-20">
        <Spinner size={24} />
      </div>
    );
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
    <div className="mx-auto max-w-[1600px] px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <p className="label-mono text-accent">Owner tools</p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Admin</h1>
      </header>
      <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
        <Tab.List className="flex gap-1 overflow-x-auto border-b border-br-subtle">
          {tabs.map((tab) => (
            <Tab
              key={tab.name}
              className={({ selected }: { selected: boolean }) =>
                classNames(
                  "relative flex h-11 shrink-0 items-center px-3 text-sm font-semibold transition-colors after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:origin-left after:bg-accent after:transition-transform after:duration-300 after:ease-forge",
                  selected
                    ? "text-txt-primary after:scale-x-100"
                    : "text-txt-muted after:scale-x-0 hover:text-txt-primary"
                )
              }
            >
              {tab.name}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="mt-6">
          {tabs.map((tab, idx) => (
            <Tab.Panel key={idx} className="rounded-xl border border-br-subtle bg-surface-card p-5 sm:p-6">
              <tab.component />
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};
