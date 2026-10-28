import { Link, useLocation } from "react-router-dom";
import {
  BookOpenText,
  CircleHelp,
  House,
  LayoutDashboard,
  MessagesSquare,
  PanelLeftClose,
  PanelLeftOpen,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { FORUM_CATEGORIES } from "@/config/forumCategories";
import { FORUM_PATHS } from "../constants/forumPaths";

import type { ForumCategory } from "../types/forum";

export const FORUM_RAIL_WIDTH = 72;
export const FORUM_EXPANDED_WIDTH = 280;

interface ForumSidebarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  categories: ForumCategory[];
  className?: string;
}

interface SidebarLinkData {
  icon: LucideIcon;
  label: string;
  to: string;
}

const MAIN_LINKS: SidebarLinkData[] = [
  { icon: House, label: "Home", to: FORUM_PATHS.HOME },
  { icon: LayoutDashboard, label: "Dashboard", to: FORUM_PATHS.DASHBOARD },
  { icon: UserRound, label: "My threads", to: FORUM_PATHS.MY_THREADS },
];

const INFO_LINKS: SidebarLinkData[] = [
  { icon: BookOpenText, label: "Forum rules", to: FORUM_PATHS.RULES },
  { icon: CircleHelp, label: "Help", to: FORUM_PATHS.HELP },
];

const SidebarLink = ({
  icon: Icon,
  label,
  to,
  isActive,
  showLabel,
}: SidebarLinkData & { isActive: boolean; showLabel: boolean }) => (
  <Link
    to={to}
    title={showLabel ? undefined : label}
    aria-label={showLabel ? undefined : label}
    aria-current={isActive ? "page" : undefined}
    className={`relative grid h-10 grid-cols-[40px_1fr] items-center overflow-hidden rounded-md text-sm transition-colors before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:bg-accent before:transition-transform before:duration-300 before:ease-forge ${
      isActive
        ? "bg-muted font-semibold text-txt-primary before:scale-y-100"
        : "text-txt-secondary before:scale-y-0 hover:bg-muted/60 hover:text-txt-primary"
    }`}
  >
    <span className="flex size-10 items-center justify-center">
      <Icon className={`size-[18px] ${isActive ? "text-accent" : ""}`} aria-hidden="true" />
    </span>
    <span
      className={`min-w-0 truncate pr-3 transition-opacity duration-150 ${
        showLabel ? "opacity-100 delay-100" : "pointer-events-none opacity-0"
      }`}
    >
      {label}
    </span>
  </Link>
);

const SectionLabel = ({ children, show }: { children: string; show: boolean }) => (
  <p
    className={`label-mono mb-1 mt-5 h-4 px-3 text-txt-muted transition-opacity duration-150 ${
      show ? "opacity-100 delay-100" : "opacity-0"
    }`}
    aria-hidden={!show}
  >
    {show ? children : ""}
  </p>
);

export const ForumSidebar = ({
  isSidebarOpen,
  toggleSidebar,
  categories,
  className,
}: ForumSidebarProps) => {
  const { pathname } = useLocation();

  const renderLinks = (links: SidebarLinkData[]) => (
    <div className="space-y-0.5">
      {links.map((link) => (
        <SidebarLink
          key={link.to}
          {...link}
          isActive={pathname === link.to}
          showLabel={isSidebarOpen}
        />
      ))}
    </div>
  );

  return (
    <aside
      className={`${className ?? ""} sticky top-16 hidden h-[calc(100dvh-4rem)] shrink-0 self-start overflow-hidden border-r border-br-subtle bg-page transition-[width] duration-300 ease-forge md:flex md:flex-col`}
      style={{ width: isSidebarOpen ? FORUM_EXPANDED_WIDTH : FORUM_RAIL_WIDTH }}
      aria-label="Forum"
    >
      <div className="grid h-14 shrink-0 grid-cols-[40px_1fr] items-center border-b border-br-subtle px-4">
        <button
          type="button"
          onClick={toggleSidebar}
          aria-expanded={isSidebarOpen}
          aria-label={isSidebarOpen ? "Collapse forum navigation" : "Expand forum navigation"}
          className="flex size-10 items-center justify-center rounded-md text-txt-secondary transition-colors hover:bg-muted hover:text-txt-primary"
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="size-5" aria-hidden="true" />
          ) : (
            <PanelLeftOpen className="size-5" aria-hidden="true" />
          )}
        </button>
        <span
          className={`flex items-center gap-2 pl-3 font-display text-sm font-semibold transition-opacity duration-150 ${
            isSidebarOpen ? "opacity-100 delay-100" : "pointer-events-none opacity-0"
          }`}
        >
          <MessagesSquare className="size-4 text-accent" aria-hidden="true" />
          Forum
        </span>
      </div>

      <nav className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden px-4 pb-4">
        <SectionLabel show={isSidebarOpen}>Browse</SectionLabel>
        {renderLinks(MAIN_LINKS)}

        <SectionLabel show={isSidebarOpen}>Categories</SectionLabel>
        {renderLinks(
          categories.map((category) => ({
            icon: FORUM_CATEGORIES.find((item) => item.id === category.id)?.icon ?? MessagesSquare,
            label: category.name,
            to: FORUM_PATHS.CATEGORY(category.id),
          }))
        )}

        <div className="mt-auto">
          <SectionLabel show={isSidebarOpen}>Info</SectionLabel>
          {renderLinks(INFO_LINKS)}
        </div>
      </nav>
    </aside>
  );
};
