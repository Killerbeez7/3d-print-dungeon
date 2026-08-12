import { Link, useLocation } from "react-router-dom";
import { LuPanelLeftClose, LuPanelLeftOpen } from "react-icons/lu";
import { MdDashboard, MdHome } from "react-icons/md";
import { FaInfoCircle, FaQuestionCircle, FaUser } from "react-icons/fa";
import { FORUM_CATEGORIES } from "@/config/forumCategories";
import { FORUM_PATHS } from "../constants/forumPaths";

import type { ForumCategory } from "../types/forum";
import type { IconType } from "react-icons";

export const FORUM_RAIL_WIDTH = 72;
export const FORUM_EXPANDED_WIDTH = 320;

interface ForumSidebarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  categories: ForumCategory[];
  className?: string;
}

interface SidebarLinkProps {
  icon: IconType;
  label: string;
  to: string;
  isActive?: boolean;
  showLabel: boolean;
}

interface SidebarLinkData {
  icon: IconType;
  label: string;
  to: string;
}

const MAIN_LINKS: SidebarLinkData[] = [
  {
    icon: MdHome,
    label: "Home",
    to: FORUM_PATHS.HOME,
  },
  {
    icon: MdDashboard,
    label: "Dashboard",
    to: FORUM_PATHS.DASHBOARD,
  },
  {
    icon: FaUser,
    label: "My Threads",
    to: FORUM_PATHS.MY_THREADS,
  },
];

const INFO_LINKS: SidebarLinkData[] = [
  {
    icon: FaInfoCircle,
    label: "Forum Rules",
    to: FORUM_PATHS.RULES,
  },
  {
    icon: FaQuestionCircle,
    label: "Help",
    to: FORUM_PATHS.HELP,
  },
];

const SidebarLink = ({
  icon: Icon,
  label,
  to,
  isActive = false,
  showLabel,
}: SidebarLinkProps) => {
  return (
    <Link
      to={to}
      title={showLabel ? undefined : label}
      aria-label={label}
      className={[
        "grid h-10 grid-cols-[40px_1fr] items-center rounded-lg text-sm transition-colors duration-200",
        isActive
          ? "bg-[var(--bg-surface)] font-semibold text-[var(--txt-primary)] shadow-sm"
          : "text-[var(--txt-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--txt-primary)] overflow-hidden",
      ].join(" ")}
    >
      <span className="flex h-10 w-10 items-center justify-center">
        <Icon size={19} className="shrink-0" />
      </span>

      <span
        className={[
          "min-w-0 overflow-hidden whitespace-nowrap pl-2 pr-3 transition-opacity duration-150",
          showLabel ? "opacity-100 delay-100" : "pointer-events-none opacity-0",
        ].join(" ")}
      >
        {label}
      </span>
    </Link>
  );
};

export const ForumSidebar = ({
  isSidebarOpen,
  toggleSidebar,
  categories,
  className,
}: ForumSidebarProps) => {
  const location = useLocation();

  const showLabels = isSidebarOpen;

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const isCategoryActive = (categoryId: string) => {
    return location.pathname === FORUM_PATHS.CATEGORY(categoryId);
  };

  const renderSection = (links: SidebarLinkData[]) => {
    return (
      <div className="space-y-1">
        {links.map((link) => {
          return (
            <SidebarLink
              key={link.to}
              icon={link.icon}
              label={link.label}
              to={link.to}
              isActive={isActive(link.to)}
              showLabel={showLabels}
            />
          );
        })}
      </div>
    );
  };

  return (
    <aside
      className={[
        className ?? "",
        "sticky top-20 hidden self-start shrink-0 overflow-hidden border-r border-[var(--br-secondary)]",
        "bg-[var(--bg-primary)] text-[var(--txt-primary)] shadow-sm transition-[width] duration-300 ease-in-out md:flex md:flex-col",
      ].join(" ")}
      style={{
        width: isSidebarOpen ? FORUM_EXPANDED_WIDTH : FORUM_RAIL_WIDTH,

        height: "calc(100vh - 5rem)",
      }}
    >
      <div className="grid h-14 grid-cols-[40px_1fr] items-center px-4">
        <button
          type="button"
          onClick={toggleSidebar}
          aria-expanded={isSidebarOpen}
          aria-label={
            isSidebarOpen ? "Collapse forum navigation" : "Expand forum navigation"
          }
          className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--txt-secondary)] transition hover:bg-[var(--bg-surface)] hover:text-[var(--txt-primary)]"
        >
          {isSidebarOpen ? <LuPanelLeftClose size={20} /> : <LuPanelLeftOpen size={20} />}
        </button>

        <span
          className={[
            "min-w-0 overflow-hidden whitespace-nowrap pl-3 text-sm font-semibold transition-opacity duration-150",
            showLabels ? "opacity-100 delay-100" : "pointer-events-none opacity-0",
          ].join(" ")}
        >
          Forum
        </span>
      </div>

      <nav className="flex min-h-0 flex-1 flex-col border-t border-[var(--br-secondary)] px-4 py-3">
        {renderSection(MAIN_LINKS)}

        <div className="my-4 border-t border-[var(--br-secondary)]" />

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="space-y-1">
            {categories.map((category) => {
              const configCategory = FORUM_CATEGORIES.find((item) => {
                return item.id === category.id;
              });

              const CategoryIcon = configCategory?.icon ?? FaQuestionCircle;

              return (
                <SidebarLink
                  key={category.id}
                  icon={CategoryIcon}
                  label={category.name}
                  to={FORUM_PATHS.CATEGORY(category.id)}
                  isActive={isCategoryActive(category.id)}
                  showLabel={showLabels}
                />
              );
            })}
          </div>
        </div>

        <div className="my-4 border-t border-[var(--br-secondary)]" />

        {renderSection(INFO_LINKS)}
      </nav>
    </aside>
  );
};
