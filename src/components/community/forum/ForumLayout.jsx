import { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useForum } from "@/hooks/useForum";
import { LuPanelLeftClose, LuPanelLeftOpen } from "react-icons/lu";
import { MdHome, MdDashboard } from "react-icons/md";
import { FaPlusSquare, FaUser, FaInfoCircle, FaQuestionCircle } from "react-icons/fa";
import PropTypes from "prop-types";

const SidebarLink = ({ icon: Icon, label, to, onClick, className = "" }) => (
    <Link
        to={to}
        onClick={onClick}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[var(--bg-surface)] ${className}`}
    >
        {Icon && <Icon className="text-lg" />}
        {label && <span>{label}</span>}
    </Link>
);

SidebarLink.propTypes = {
    icon: PropTypes.elementType,
    label: PropTypes.node,
    to: PropTypes.string.isRequired,
    onClick: PropTypes.func,
    className: PropTypes.string,
};

export const ForumLayout = () => {
    const location = useLocation();
    const { categories } = useForum();
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);

    useEffect(() => {
        const handleResize = () => {
            setIsSidebarOpen(window.innerWidth >= 768);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const handleSidebarClick = () => {
        if (window.innerWidth < 768) {
            setIsSidebarOpen(false);
        }
    };

    return (
        <div className="relative flex min-h-screen">
            <div className="sticky top-20 h-[calc(100vh-120px)]">
                {/* Compact Sidebar */}
                <div
                    className={`absolute mt-2 left-0 w-[60px] h-[calc(100vh-120px)] flex flex-col transition-transform duration-200 ${
                        !isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
                >
                    <section className="text-[var(--txt-primary)] h-full">
                        <div className="p-2">
                            <div className="flex justify-center items-center">
                                <button
                                    onClick={toggleSidebar}
                                    className="p-2 mt-2 rounded-[10px] text-[var(--txt-secondary)] hover:bg-[var(--bg-surface)]"
                                    aria-label="Toggle sidebar"
                                >
                                    <LuPanelLeftOpen size={24} className="text-lg" />
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
                                                    className={`justify-center w-10 h-10 flex items-center mx-auto ${
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
                                        <Link
                                            to="/forum/new-thread"
                                            onClick={handleSidebarClick}
                                            className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-[var(--accent)] text-[var(--txt-highlight)] hover:bg-[var(--accent-hover)] transition shadow-lg mb-2"
                                            aria-label="New Thread"
                                        >
                                            <FaPlusSquare className="text-2xl" />
                                        </Link>
                                        <div className="my-2 border-t border-[var(--br-secondary)] w-full" />
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
                    className={`absolute left-0 w-[300px] h-[calc(100vh-120px)] flex flex-col transition-transform duration-200 ${
                        isSidebarOpen ? "translate-x-0" : "-translate-x-[300px]"
                    }`}
                >
                    <section className="text-[var(--txt-primary)] h-full">
                        <div className="p-4">
                            <div className="flex justify-between items-center mb-2">
                                <h1 className="font-bold">Forum</h1>
                                <button
                                    onClick={toggleSidebar}
                                    className="p-2 rounded-[10px] text-[var(--txt-secondary)] hover:bg-[var(--bg-surface)]"
                                    aria-label="Toggle sidebar"
                                >
                                    <LuPanelLeftClose size={24} className="text-lg" />
                                </button>
                            </div>
                            <p className="text-sm text-[var(--txt-secondary)]">
                                Discuss 3D printing topics
                            </p>
                        </div>

                        <div className="divider-top p-4 flex-1">
                            <nav className="space-y-1">
                                {categories && (
                                    <>
                                        {/* MAIN */}
                                        <div className="mb-4">
                                            <h4 className="px-3 text-xs font-semibold text-[var(--txt-muted)] uppercase tracking-wider mb-2">
                                                MAIN
                                            </h4>
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
                                        <div className="my-2 border-t border-[var(--br-secondary)]" />
                                        {/* CATEGORIES */}
                                        <div className="mb-4">
                                            <h4 className="px-3 text-xs font-semibold text-[var(--txt-muted)] uppercase tracking-wider mb-2">
                                                CATEGORIES
                                            </h4>
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
                                                                ? "bg-[var(--bg-surface)] text-[var(--txt-primary)] font-semibold"
                                                                : "hover:bg-[var(--bg-surface)]"
                                                        }`}
                                                    />
                                                );
                                            })}
                                        </div>
                                        <div className="my-2 border-t border-[var(--br-secondary)]" />
                                        {/* ACTIONS */}
                                        <div className="mb-4">
                                            <h4 className="px-3 text-xs font-semibold text-[var(--txt-muted)] uppercase tracking-wider mb-2">
                                                ACTIONS
                                            </h4>
                                            <SidebarLink
                                                icon={FaPlusSquare}
                                                label="New Thread"
                                                to="/forum/new-thread"
                                                onClick={handleSidebarClick}
                                                className="font-semibold bg-[var(--accent)] text-[var(--txt-highlight)] hover:bg-[var(--accent-hover)]"
                                            />
                                        </div>
                                        <div className="my-2 border-t border-[var(--br-secondary)]" />
                                        {/* INFO */}
                                        <div>
                                            <h4 className="px-3 text-xs font-semibold text-[var(--txt-muted)] uppercase tracking-wider mb-2">
                                                INFO
                                            </h4>
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

            {/* Main content */}
            <div
                className={`flex-1 mt-2 p-4 transition-all duration-200 ${
                    isSidebarOpen ? "ml-[300px]" : "ml-[60px]"
                }`}
            >
                <Outlet />
            </div>
        </div>
    );
};
