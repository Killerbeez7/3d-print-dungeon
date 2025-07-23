import { Link, useLocation, useNavigate } from "react-router-dom";
import { LuPanelLeftClose, LuPanelLeftOpen } from "react-icons/lu";
import { MdHome, MdDashboard } from "react-icons/md";
import { FaPlusSquare, FaUser, FaInfoCircle, FaQuestionCircle } from "react-icons/fa";
import { useModal } from "@/hooks/useModal";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { ForumSidebarProps } from "./ForumLayout";
import type { IconType } from "react-icons";
import type { FC, ReactNode } from "react";

interface SidebarLinkProps {
    icon?: IconType;
    label?: ReactNode;
    to: string;
    onClick?: () => void;
    className?: string;
}

const SidebarLink: FC<SidebarLinkProps> = ({ icon: Icon, label, to, onClick, className = "" }) => (
    <Link
        to={to}
        onClick={onClick}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[var(--bg-surface)] transition-all duration-200 ${className}`}
    >
        {Icon && <Icon className="text-lg flex-shrink-0" />}
        {label && <span className="truncate">{label}</span>}
    </Link>
);

export const ForumSidebar: FC<ForumSidebarProps> = ({
    isSidebarOpen,
    toggleSidebar,
    handleSidebarClick,
    categories,
}) => {
    const { currentUser } = useAuth();
    const { open } = useModal("auth");
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <>
            {/* Mobile overlay backdrop */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-all duration-300 ease-in-out"
                    onClick={toggleSidebar}
                />
            )}
            
            <div className="sticky top-20 h-[calc(100vh-120px)] z-50">
                {/* Compact Sidebar */}
                <div
                    className={`absolute mt-2 left-0 w-[60px] h-[calc(100vh-120px)] flex flex-col transition-all duration-300 ease-in-out ${
                        !isSidebarOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
                    }`}
                >
                    <section className="text-[var(--txt-primary)] h-full bg-[var(--bg-primary)] border-r border-[var(--br-secondary)] shadow-lg">
                        <div className="p-2">
                            <div className="flex justify-center items-center">
                                <button
                                    onClick={toggleSidebar}
                                    className="p-2 mt-2 rounded-lg text-[var(--txt-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--txt-primary)] transition-all duration-200"
                                    aria-label="Toggle sidebar"
                                >
                                    <LuPanelLeftOpen size={24} className="text-lg" />
                                </button>
                            </div>
                        </div>

                        <div className="divider-top p-[10px] flex-1">
                            <nav className="space-y-2 flex flex-col items-center">
                                {categories && (
                                    <>
                                        {/* MAIN */}
                                        <SidebarLink
                                            icon={MdHome}
                                            label={null}
                                            to="/forum"
                                            onClick={handleSidebarClick}
                                            className="justify-center w-10 h-10 flex items-center mx-auto"
                                        />
                                        <SidebarLink
                                            icon={MdDashboard}
                                            label={null}
                                            to="/forum/dashboard"
                                            onClick={handleSidebarClick}
                                            className="justify-center w-10 h-10 flex items-center mx-auto"
                                        />
                                        <SidebarLink
                                            icon={FaUser}
                                            label={null}
                                            to="/forum/my-threads"
                                            onClick={handleSidebarClick}
                                            className="justify-center w-10 h-10 flex items-center mx-auto"
                                        />
                                        <div className="my-3 border-t border-[var(--br-secondary)] w-full" />
                                        {/* CATEGORIES */}
                                        {categories.map((category) => {
                                            const Icon = category.icon;
                                            return (
                                                <SidebarLink
                                                    key={category.id}
                                                    icon={Icon}
                                                    label={null}
                                                    to={`/forum/category/${category.id}`}
                                                    onClick={handleSidebarClick}
                                                    className={`justify-center w-10 h-10 flex items-center mx-auto ${
                                                        location.pathname ===
                                                        `/forum/category/${category.id}`
                                                            ? "bg-[var(--bg-surface)] text-[var(--txt-primary)] shadow-sm"
                                                            : "hover:bg-[var(--bg-surface)]"
                                                    }`}
                                                />
                                            );
                                        })}
                                        <div className="my-3 border-t border-[var(--br-secondary)] w-full" />
                                        {/* ACTIONS */}
                                        <button
                                            aria-label="New Thread"
                                            className="flex items-center justify-center w-12 h-12 mx-auto
             rounded-full bg-[var(--accent)] text-[var(--txt-highlight)]
             hover:bg-[var(--accent-hover)] hover:scale-105 transition-all duration-200 shadow-lg mb-2"
                                            onClick={() => {
                                                if (!currentUser) {
                                                    open({ mode: "login" });
                                                    return;
                                                }
                                                navigate("/forum/new-thread");
                                                handleSidebarClick();
                                            }}
                                        >
                                            <FaPlusSquare className="text-2xl" />
                                        </button>
                                        <div className="my-3 border-t border-[var(--br-secondary)] w-full" />
                                        {/* INFO */}
                                        <SidebarLink
                                            icon={FaInfoCircle}
                                            label={null}
                                            to="/forum/rules"
                                            onClick={handleSidebarClick}
                                            className="justify-center w-10 h-10 flex items-center mx-auto"
                                        />
                                        <SidebarLink
                                            icon={FaQuestionCircle}
                                            label={null}
                                            to="/forum/help"
                                            onClick={handleSidebarClick}
                                            className="justify-center w-10 h-10 flex items-center mx-auto"
                                        />
                                    </>
                                )}
                            </nav>
                        </div>
                    </section>
                </div>

                {/* Full Sidebar */}
                <div
                    className={`absolute left-0 h-[calc(100vh-120px)] flex flex-col transition-all duration-300 ease-in-out transform ${
                        isSidebarOpen 
                            ? "translate-x-0 opacity-100" 
                            : "-translate-x-full opacity-0"
                    } ${
                        isSidebarOpen 
                            ? "w-full md:w-[320px]" 
                            : "w-[320px]"
                    }`}
                >
                    <section className="text-[var(--txt-primary)] h-full bg-[var(--bg-primary)] md:bg-[var(--bg-primary)] border-r border-[var(--br-secondary)] shadow-2xl md:shadow-lg">
                        {/* Header */}
                        <div className="p-6 border-b border-[var(--br-secondary)]">
                            <div className="flex justify-between items-center mb-3">
                                <h1 className="text-xl font-bold text-[var(--txt-primary)]">Forum</h1>
                                <button
                                    onClick={toggleSidebar}
                                    className="p-2 rounded-lg text-[var(--txt-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--txt-primary)] transition-all duration-200"
                                    aria-label="Toggle sidebar"
                                >
                                    <LuPanelLeftClose size={24} className="text-lg" />
                                </button>
                            </div>
                            <p className="text-sm text-[var(--txt-secondary)]">
                                Discuss 3D printing topics and connect with the community
                            </p>
                        </div>

                        {/* Content */}
                        <div className="p-6 flex-1 overflow-y-auto">
                            <nav className="space-y-6">
                                {categories && (
                                    <>
                                        {/* MAIN */}
                                        <div>
                                            <h4 className="px-2 text-xs font-semibold text-[var(--txt-muted)] uppercase tracking-wider mb-3">
                                                MAIN
                                            </h4>
                                            <div className="space-y-1">
                                                <SidebarLink
                                                    icon={MdHome}
                                                    label="Home"
                                                    to="/forum"
                                                    onClick={handleSidebarClick}
                                                />
                                                <SidebarLink
                                                    icon={MdDashboard}
                                                    label="Dashboard"
                                                    to="/forum/dashboard"
                                                    onClick={handleSidebarClick}
                                                />
                                                <SidebarLink
                                                    icon={FaUser}
                                                    label="My Threads"
                                                    to="/forum/my-threads"
                                                    onClick={handleSidebarClick}
                                                />
                                            </div>
                                        </div>
                                        
                                        {/* CATEGORIES */}
                                        <div>
                                            <h4 className="px-2 text-xs font-semibold text-[var(--txt-muted)] uppercase tracking-wider mb-3">
                                                CATEGORIES
                                            </h4>
                                            <div className="space-y-1">
                                                {categories.map((category) => {
                                                    const Icon = category.icon;
                                                    return (
                                                        <SidebarLink
                                                            key={category.id}
                                                            icon={Icon}
                                                            label={category.name}
                                                            to={`/forum/category/${category.id}`}
                                                            onClick={handleSidebarClick}
                                                            className={`${
                                                                location.pathname ===
                                                                `/forum/category/${category.id}`
                                                                    ? "bg-[var(--bg-surface)] text-[var(--txt-primary)] font-semibold shadow-sm border-l-4 border-[var(--accent)]"
                                                                    : "hover:bg-[var(--bg-surface)]"
                                                            }`}
                                                        />
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        
                                        {/* ACTIONS */}
                                        <div>
                                            <h4 className="px-2 text-xs font-semibold text-[var(--txt-muted)] uppercase tracking-wider mb-3">
                                                ACTIONS
                                            </h4>
                                            <button
                                                className="flex items-center w-full gap-3 px-4 py-3 rounded-lg
             font-semibold bg-[var(--accent)]
             text-[var(--txt-highlight)]
             hover:bg-[var(--accent-hover)] hover:scale-[1.02]
             transition-all duration-200 shadow-md"
                                                onClick={() => {
                                                    if (!currentUser) {
                                                        open({ mode: "login" });
                                                        return;
                                                    }
                                                    navigate("/forum/new-thread");
                                                    handleSidebarClick();
                                                }}
                                            >
                                                <FaPlusSquare className="text-lg flex-shrink-0" />
                                                <span>New Thread</span>
                                            </button>
                                        </div>
                                        
                                        {/* INFO */}
                                        <div>
                                            <h4 className="px-2 text-xs font-semibold text-[var(--txt-muted)] uppercase tracking-wider mb-3">
                                                INFO
                                            </h4>
                                            <div className="space-y-1">
                                                <SidebarLink
                                                    icon={FaInfoCircle}
                                                    label="Forum Rules"
                                                    to="/forum/rules"
                                                    onClick={handleSidebarClick}
                                                />
                                                <SidebarLink
                                                    icon={FaQuestionCircle}
                                                    label="Help"
                                                    to="/forum/help"
                                                    onClick={handleSidebarClick}
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}
                            </nav>
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
};
