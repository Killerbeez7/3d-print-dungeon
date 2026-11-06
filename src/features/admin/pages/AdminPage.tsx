import { lazy, Suspense } from "react";
import { Navigate, NavLink, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Box, Flag, LayoutDashboard, NotebookPen, Settings, Users, Wrench } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { Spinner } from "@/features/shared/reusable/Spinner";
import { fetchAdminOverview } from "../services/adminStatsService";
import { AdminOverview } from "../components/overview/AdminOverview";
import { AdminSectionHeader } from "../components/shared/AdminSectionHeader";

const AdminModels = lazy(() =>
  import("../components/models/AdminModels").then((m) => ({ default: m.AdminModels }))
);
const UserManagement = lazy(() =>
  import("../components/UserManagement").then((m) => ({ default: m.UserManagement }))
);
const ContentModeration = lazy(() =>
  import("../components/ContentModeration").then((m) => ({ default: m.ContentModeration }))
);
const SiteSettings = lazy(() =>
  import("../components/SiteSettings").then((m) => ({ default: m.SiteSettings }))
);
const MaintenanceSettings = lazy(() =>
  import("../components/MaintenanceSettings").then((m) => ({ default: m.MaintenanceSettings }))
);
const ComingSoonSettings = lazy(() =>
  import("../components/ComingSoonSettings").then((m) => ({ default: m.ComingSoonSettings }))
);
const DevlogManager = lazy(() =>
  import("../components/DevlogManager").then((m) => ({ default: m.DevlogManager }))
);
const Scripts = lazy(() => import("../components/Scripts").then((m) => ({ default: m.Scripts })));

export const ADMIN_BASE = "/admin-dashboard";

/** Older sections keep their own inner layout; this frames them consistently. */
const Panel = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-xl border border-br-subtle bg-surface-card p-5 sm:p-6">{children}</div>
);

interface Section {
  id: string;
  label: string;
  icon: LucideIcon;
  render: () => React.ReactNode;
}

const SECTIONS: Section[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, render: () => <AdminOverview /> },
  { id: "models", label: "Models", icon: Box, render: () => <AdminModels /> },
  {
    id: "users",
    label: "Users",
    icon: Users,
    render: () => (
      <>
        <AdminSectionHeader title="Users" description="Accounts and roles. Only a super admin can grant admin." />
        <Panel>
          <UserManagement />
        </Panel>
      </>
    ),
  },
  {
    id: "reports",
    label: "Reports",
    icon: Flag,
    render: () => (
      <>
        <AdminSectionHeader title="Reports" description="Content people have reported." />
        <Panel>
          <ContentModeration />
        </Panel>
      </>
    ),
  },
  {
    id: "settings",
    label: "Site settings",
    icon: Settings,
    render: () => (
      <>
        <AdminSectionHeader
          title="Site settings"
          description="Coming-soon page, registration, uploads and maintenance mode."
        />
        <div className="space-y-6">
          <Panel>
            <ComingSoonSettings />
          </Panel>
          <Panel>
            <SiteSettings />
          </Panel>
          <Panel>
            <MaintenanceSettings />
          </Panel>
        </div>
      </>
    ),
  },
  {
    id: "devlog",
    label: "Dev log",
    icon: NotebookPen,
    render: () => (
      <>
        <AdminSectionHeader
          title="Dev log"
          description="Posts shown in the Dev log tab of the coming-soon page. Anyone can read them."
        />
        <Panel>
          <DevlogManager />
        </Panel>
      </>
    ),
  },
  {
    id: "tools",
    label: "Tools",
    icon: Wrench,
    render: () => (
      <>
        <AdminSectionHeader title="Tools" description="One-off scripts and test helpers. Use with care." />
        <Panel>
          <Scripts />
        </Panel>
      </>
    ),
  },
];

const SectionFallback = () => (
  <div role="status" aria-label="Loading" className="space-y-4">
    <div className="skeleton-line h-7 w-40" />
    <div className="skeleton-print h-64 rounded-xl" />
  </div>
);

export const AdminPage = () => {
  const { currentUser, isAdmin, loading } = useAuth();
  const { section: sectionId } = useParams<{ section?: string }>();
  const section = SECTIONS.find((item) => item.id === (sectionId ?? "overview"));

  // Shares the overview's cached data, for the pending-reports badge.
  const { data: overview } = useQuery({
    queryKey: ["admin", "overview"],
    queryFn: fetchAdminOverview,
    staleTime: 2 * 60 * 1000,
    enabled: Boolean(isAdmin),
  });

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

  if (!section) {
    return <Navigate to={ADMIN_BASE} replace />;
  }

  const badge = (id: string) => (id === "reports" && overview?.pendingReports ? overview.pendingReports : 0);

  return (
    <div className="mx-auto max-w-[1600px] px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
        <aside className="lg:sticky lg:top-24 lg:w-56 lg:shrink-0 lg:self-start">
          <p className="label-mono text-accent">Owner tools</p>
          <p className="mt-1 text-xl font-bold text-txt-primary">Admin</p>

          <nav aria-label="Admin sections" className="mt-4">
            <ul className="-mx-4 flex gap-1 overflow-x-auto px-4 [scrollbar-width:none] lg:mx-0 lg:flex-col lg:px-0">
              {SECTIONS.map((item) => (
                <li key={item.id} className="shrink-0">
                  <NavLink
                    to={item.id === "overview" ? ADMIN_BASE : `${ADMIN_BASE}/${item.id}`}
                    end
                    className={({ isActive }) =>
                      `relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors lg:py-2.5 ${
                        isActive
                          ? "bg-accent-soft text-txt-primary"
                          : "text-txt-secondary hover:bg-muted hover:text-txt-primary"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span
                          className={`absolute inset-y-2 left-0 hidden w-0.5 bg-accent lg:block ${isActive ? "" : "lg:hidden"}`}
                          aria-hidden="true"
                        />
                        <item.icon className={`size-4 shrink-0 ${isActive ? "text-accent" : ""}`} aria-hidden="true" />
                        <span className="whitespace-nowrap">{item.label}</span>
                        {badge(item.id) > 0 && (
                          <span className="label-mono ml-auto rounded-full bg-ember-fill px-1.5 text-[0.65rem] leading-5 text-ember-on">
                            {badge(item.id)}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <main className="min-w-0 flex-1">
          <Suspense fallback={<SectionFallback />}>{section.render()}</Suspense>
        </main>
      </div>
    </div>
  );
};
