import { Link, useLocation } from "react-router-dom";
import { LuPanelLeftClose, LuPanelLeftOpen } from "react-icons/lu";
import { MdDashboard, MdHome } from "react-icons/md";
import { FaInfoCircle, FaQuestionCircle, FaUser } from "react-icons/fa";
import type { ForumSidebarProps } from "@/features/forum/types/forum";
import type { IconType } from "react-icons";
import type { FC } from "react";

export const FORUM_RAIL_WIDTH = 72;
export const FORUM_EXPANDED_WIDTH = 320;

interface SidebarLinkProps {
    icon: IconType;
    label: string;
    to: string;
    onClick?: () => void;
    isActive?: boolean;
    showLabel: boolean;
}

const SidebarLink: FC<SidebarLinkProps> = ({
    icon: Icon,
    label,
    to,
    onClick,
    isActive = false,
    showLabel,
}) => {
    return (
        <Link
            to={to}
            onClick={onClick}
            title={showLabel ? undefined : label}
            aria-label={label}
            className={[
                "grid h-10 grid-cols-[40px_1fr] items-center rounded-lg text-sm transition-colors duration-200",
                isActive
                    ? "bg-[var(--bg-surface)] font-semibold text-[var(--txt-primary)]"
                    : "text-[var(--txt-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--txt-primary)]",
            ].join(" ")}
        >
            <span className="flex h-10 w-10 items-center justify-center">
                <Icon size={20} className="shrink-0" />
            </span>

            <span
                className={[
                    "min-w-0 overflow-hidden whitespace-nowrap pr-3 pl-2 will-change-[opacity] transition-opacity duration-150 ease-out",
                    showLabel ? "opacity-100 delay-100" : "pointer-events-none opacity-0 delay-0",
                ].join(" ")}
            >
                {label}
            </span>
        </Link>
    );
};

export const ForumSidebar: FC<ForumSidebarProps> = ({
    isSidebarOpen,
    toggleSidebar,
    handleSidebarClick,
    categories,
    className,
}) => {
    const location = useLocation();
    const showLabels = isSidebarOpen;

    const isActive = (path: string) => location.pathname === path;
    const isCategoryActive = (categoryId: string) =>
        location.pathname === `/forum/category/${categoryId}`;

    const mainLinks = [
        { icon: MdHome, label: "Home", to: "/forum" },
        { icon: MdDashboard, label: "Dashboard", to: "/forum/dashboard" },
        { icon: FaUser, label: "My Threads", to: "/forum/my-threads" },
    ];

    const infoLinks = [
        { icon: FaInfoCircle, label: "Forum Rules", to: "/forum/rules" },
        { icon: FaQuestionCircle, label: "Help", to: "/forum/help" },
    ];

    const handleLinkClick = () => {
        handleSidebarClick();
    };

    const renderSection = (
        links: Array<{ icon: IconType; label: string; to: string }>
    ) => (
        <div className="space-y-1">
            {links.map((link) => (
                <SidebarLink
                    key={link.to}
                    icon={link.icon}
                    label={link.label}
                    to={link.to}
                    onClick={handleLinkClick}
                    isActive={isActive(link.to)}
                    showLabel={showLabels}
                />
            ))}
        </div>
    );

    return (
        <aside
            className={[
                className ?? "",
                "sticky top-20 hidden self-start shrink-0 overflow-hidden border-r border-[var(--br-secondary)]",
                "bg-[var(--bg-primary)] text-[var(--txt-primary)] shadow-xl transition-[width] duration-300 ease-in-out md:flex md:flex-col",
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
                    aria-pressed={isSidebarOpen}
                    aria-label={
                        isSidebarOpen
                            ? "Collapse forum navigation"
                            : "Expand forum navigation"
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--txt-secondary)] transition-colors duration-200 hover:bg-[var(--bg-surface)] hover:text-[var(--txt-primary)]"
                >
                    {isSidebarOpen ? (
                        <LuPanelLeftClose size={20} />
                    ) : (
                        <LuPanelLeftOpen size={20} />
                    )}
                </button>

                <span
                    className={[
                        "min-w-0 overflow-hidden whitespace-nowrap pl-3 text-sm font-semibold text-[var(--txt-primary)] will-change-[opacity] transition-opacity duration-150 ease-out",
                        showLabels ? "opacity-100 delay-100" : "pointer-events-none opacity-0 delay-0",
                    ].join(" ")}
                >
                    Forum
                </span>
            </div>

            <nav className="flex min-h-0 flex-1 flex-col border-t border-[var(--br-secondary)] px-4 py-3">
                <div className="space-y-1">
                    {renderSection(mainLinks)}
                </div>

                <div className="my-4 border-t border-[var(--br-secondary)]" />

                <div className="min-h-0 flex-1 overflow-y-auto">
                    <div className="space-y-1">
                        {categories.map((category) => {
                            const CategoryIcon = category.icon ?? FaQuestionCircle;

                            return (
                                <SidebarLink
                                    key={category.id}
                                    icon={CategoryIcon}
                                    label={category.name}
                                    to={`/forum/category/${category.id}`}
                                    onClick={handleLinkClick}
                                    isActive={isCategoryActive(category.id)}
                                    showLabel={showLabels}
                                />
                            );
                        })}
                    </div>
                </div>

                <div className="my-4 border-t border-[var(--br-secondary)]" />

                <div className="space-y-1 pb-1">
                    {renderSection(infoLinks)}
                </div>
            </nav>
        </aside>
    );
};