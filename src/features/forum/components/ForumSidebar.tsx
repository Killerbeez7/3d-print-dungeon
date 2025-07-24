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

const SidebarLink: FC<SidebarLinkProps> = ({
    icon: Icon,
    label,
    to,
    onClick,
    className = "",
}) => (
    <Link
        to={to}
        onClick={onClick}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-[var(--bg-surface)] ${className}`}
    >
        {Icon && <Icon size={20} width={20} height={20} />}
        {label && <span>{label}</span>}
    </Link>
);

export const ForumSidebar: FC<ForumSidebarProps> = ({
    isSidebarOpen,
    toggleSidebar,
    handleSidebarClick,
    categories,
    className,
}) => {
    const { currentUser } = useAuth();
    const { open } = useModal("auth");
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div className={`${className} sticky top-20 h-[calc(100vh-120px)]`}>
            {/* Compact Sidebar */}
            <div
                className={`absolute left-0 w-[70px] h-[calc(100vh-120px)] flex flex-col transition-all duration-300 ease-in-out ${
                    !isSidebarOpen
                        ? "translate-x-0 opacity-100"
                        : "-translate-x-full opacity-0"
                }`}
            >
                <section className="text-[var(--txt-primary)] h-full">
                    <div className="p-3">
                        <div className="flex justify-center items-center">
                            <button
                                onClick={toggleSidebar}
                                className="p-2 rounded-[10px] text-[var(--txt-secondary)] hover:bg-[var(--bg-surface)]"
                                aria-label="Toggle sidebar"
                            >
                                <LuPanelLeftOpen size={20} width={20} height={20} />
                            </button>
                        </div>
                    </div>

                    <div className="divider-top p-[10px] flex-1">
                        <nav className="space-y-1 flex flex-col items-center">
                            {categories && (
                                <>
                                    {/* MAIN */}
                                                                         <SidebarLink
                                         icon={MdHome}
                                         label={null}
                                         to="/forum"
                                         onClick={handleSidebarClick}
                                         className="justify-center flex items-center mx-auto p-2"
                                     />
                                                                         <SidebarLink
                                         icon={MdDashboard}
                                         label={null}
                                         to="/forum/dashboard"
                                         onClick={handleSidebarClick}
                                         className="justify-center flex items-center mx-auto p-2"
                                     />
                                                                         <SidebarLink
                                         icon={FaUser}
                                         label={null}
                                         to="/forum/my-threads"
                                         onClick={handleSidebarClick}
                                         className="justify-center flex items-center mx-auto p-2"
                                     />
                                    <div className="my-2 border-t border-[var(--br-secondary)] w-full" />
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
                                                                                                 className={`justify-center flex items-center mx-auto p-2 ${
                                                     location.pathname ===
                                                     `/forum/category/${category.id}`
                                                         ? "bg-[var(--bg-surface)] text-[var(--txt-primary)]"
                                                         : "hover:bg-[var(--bg-surface)]"
                                                 }`}
                                            />
                                        );
                                    })}
                                    <div className="my-2 border-t border-[var(--br-secondary)] w-full" />
                                    {/* ACTIONS */}
                                    <button
                                        aria-label="New Thread"
                                        className="flex items-center justify-center w-12 h-12 mx-auto
             rounded-full bg-[var(--accent)] text-[var(--txt-highlight)]
             hover:bg-[var(--accent-hover)] transition shadow-lg mb-2"
                                        onClick={() => {
                                            if (!currentUser) {
                                                open({ mode: "login" });
                                                return;
                                            }
                                            navigate("/forum/new-thread");
                                            handleSidebarClick();
                                        }}
                                                                         >
                                         <FaPlusSquare size={20} width={20} height={20} />
                                     </button>
                                    <div className="my-2 border-t border-[var(--br-secondary)] w-full" />
                                    {/* INFO */}
                                                                         <SidebarLink
                                         icon={FaInfoCircle}
                                         label={null}
                                         to="/forum/rules"
                                         onClick={handleSidebarClick}
                                         className="justify-center flex items-center mx-auto p-2"
                                     />
                                                                         <SidebarLink
                                         icon={FaQuestionCircle}
                                         label={null}
                                         to="/forum/help"
                                         onClick={handleSidebarClick}
                                         className="justify-center flex items-center mx-auto p-2"
                                     />
                                </>
                            )}
                        </nav>
                    </div>
                </section>
            </div>

            {/* Full Sidebar */}
            <div
                className={`hidden md:flex absolute left-0 w-[100vw] lg:w-[300px] h-[calc(100vh-120px)] flex-col transition-transform duration-200 ${
                    isSidebarOpen
                        ? "translate-x-0 opacity-100"
                        : "-translate-x-[100vw] opacity-0"
                }`}
            >
                <section
                    className={`text-[var(--txt-primary)] h-full ${
                        isSidebarOpen
                            ? "bg-[var(--bg-primary)]"
                            : "bg-[var(--bg-primary)]"
                    }`}
                >
                    <div className="p-3">
                        <div className="flex justify-end items-center">
                            <button
                                onClick={toggleSidebar}
                                className="p-2 rounded-[10px] text-[var(--txt-secondary)] hover:bg-[var(--bg-surface)]"
                                aria-label="Toggle sidebar"
                            >
                                <LuPanelLeftClose size={20} width={20} height={20} />
                            </button>
                        </div>
                    </div>

                    <div className="divider-top p-3 flex-1">
                        <nav className="space-y-1">
                            {categories && (
                                <>
                                    {/* MAIN */}

                                    <div className="mb-2">
                                        <div>
                                            <SidebarLink
                                                icon={MdHome}
                                                label="Home"
                                                to="/forum"
                                                onClick={handleSidebarClick}
                                            />
                                        </div>
                                        <div>
                                            <SidebarLink
                                                icon={MdDashboard}
                                                label="Dashboard"
                                                to="/forum/dashboard"
                                                onClick={handleSidebarClick}
                                            />
                                        </div>
                                        <div>
                                            <SidebarLink
                                                icon={FaUser}
                                                label="My Threads"
                                                to="/forum/my-threads"
                                                onClick={handleSidebarClick}
                                            />
                                        </div>
                                    </div>
                                    <div className="my-1 border-t border-[var(--br-secondary)]" />
                                    {/* CATEGORIES */}
                                    <div className="mb-2">
                                        <h5 className="px-3 text-xs font-semibold text-[var(--txt-muted)] uppercase tracking-wider mb-1">
                                            CATEGORIES
                                        </h5>
                                        {categories.map((category) => {
                                            const Icon = category.icon;
                                            return (
                                                <SidebarLink
                                                    key={category.id}
                                                    icon={Icon}
                                                    label={category.name}
                                                    to={`/forum/category/${category.id}`}
                                                    onClick={handleSidebarClick}
                                                    className={`$${
                                                        location.pathname ===
                                                        `/forum/category/${category.id}`
                                                            ? "bg-[var(--bg-surface)] text-[var(--txt-primary)] font-semibold"
                                                            : "hover:bg-[var(--bg-surface)]"
                                                    }`}
                                                />
                                            );
                                        })}
                                    </div>
                                    <div className="my-1 border-t border-[var(--br-secondary)]" />
                                    {/* ACTIONS */}
                                    <div className="mb-2">
                                        <h5 className="px-3 text-xs font-semibold text-[var(--txt-muted)] uppercase tracking-wider mb-1">
                                            ACTIONS
                                        </h5>
                                        <button
                                            className="flex items-center md:w-full w-auto gap-2 px-3 py-1.5 rounded-lg
             font-semibold bg-[var(--accent)]
             text-[var(--txt-highlight)]
             hover:bg-[var(--accent-hover)]"
                                            onClick={() => {
                                                if (!currentUser) {
                                                    open({ mode: "login" });
                                                    return;
                                                }
                                                navigate("/forum/new-thread");
                                                handleSidebarClick();
                                            }}
                                                                                 >
                                             <FaPlusSquare size={20} width={20} height={20} />
                                             <span>New Thread</span>
                                         </button>
                                    </div>
                                    <div className="my-1 border-t border-[var(--br-secondary)]" />
                                    {/* INFO */}
                                    <div>
                                        <h5 className="px-3 text-xs font-semibold text-[var(--txt-muted)] uppercase tracking-wider mb-1">
                                            INFO
                                        </h5>
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
                                </>
                            )}
                        </nav>
                    </div>
                </section>
            </div>
        </div>
    );
};
