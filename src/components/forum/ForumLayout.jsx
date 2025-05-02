import { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useForum } from "@/hooks/useForum";
import { LuPanelLeftClose, LuPanelLeftOpen } from "react-icons/lu";
import { MdHome } from "react-icons/md";
import { BiSolidCategory } from "react-icons/bi";
import { FaPlusSquare } from "react-icons/fa";

export const ForumLayout = () => {
    const location = useLocation();
    const { categories, loading } = useForum();
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);

    useEffect(() => {
        const handleResize = () => {
            setIsSidebarOpen(window.innerWidth >= 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
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
            <div className="sticky top-20 h-[calc(100vh-140px)]">
                {/* Compact Sidebar */}
                <div
                    className={`absolute mt-2 left-0 w-[60px] h-[calc(100vh-140px)] flex flex-col transition-transform duration-200 ${
                        !isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                    }`}>
                    <section className="text-txt-primary h-full">
                        <div className="p-2">
                            <div className="flex justify-center items-center">
                                <button
                                    onClick={toggleSidebar}
                                    className="p-2 mt-2 rounded-[10px] text-txt-secondary hover:bg-bg-surface"
                                    aria-label="Toggle sidebar">
                                    <LuPanelLeftOpen
                                        size={24}
                                        className="text-lg"
                                    />
                                </button>
                            </div>
                        </div>

                        <div className="divider-top p-[10px] flex-1">
                            <nav className="space-y-1">
                                <Link
                                    to="/forum"
                                    onClick={handleSidebarClick}
                                    className="block p-2 secondary-button justify-center"
                                    title="Home">
                                    <MdHome size={24} />
                                </Link>

                                <div className="mt-8 mb-2">
                                    <div className="flex justify-center">
                                        <BiSolidCategory size={20} />
                                    </div>
                                </div>

                                {loading ? (
                                    <div className="animate-pulse space-y-2">
                                        {[...Array(5)].map((_, i) => (
                                            <div
                                                key={i}
                                                className="h-10 bg-bg-surface rounded-[10px]"
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-1 text-txt-secondary">
                                        {categories.map((category) => (
                                            <Link
                                                key={category.id}
                                                to={`/forum/category/${category.id}`}
                                                onClick={handleSidebarClick}
                                                className={`flex justify-center py-[7px] px-2 rounded-[10px] ${
                                                    location.pathname ===
                                                    `/forum/category/${category.id}`
                                                        ? "bg-bg-surface text-txt-primary"
                                                        : "hover:bg-bg-surface"
                                                }`}
                                                title={category.name}>
                                                {category.icon && (
                                                    <span className="text-lg">
                                                        {category.icon}
                                                    </span>
                                                )}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </nav>
                        </div>

                        <div className="p-[10px] divider-top">
                            <Link
                                to="/forum/new-thread"
                                onClick={handleSidebarClick}
                                className="block py-[10px] text-center cta-button"
                                title="New Thread">
                                <div className="flex justify-center">
                                    <FaPlusSquare size={20} />
                                </div>
                            </Link>
                        </div>
                    </section>
                </div>

                {/* Full Sidebar */}
                <div
                    className={`absolute left-0 w-[300px] h-[calc(100vh-140px)] flex flex-col transition-transform duration-200 ${
                        isSidebarOpen ? "translate-x-0" : "-translate-x-[300px]"
                    }`}>
                    <section className="text-txt-primary h-full">
                        <div className="p-4">
                            <div className="flex justify-between items-center mb-2">
                                <h1 className="font-bold">Forum</h1>
                                <button
                                    onClick={toggleSidebar}
                                    className="p-2 rounded-[10px] text-txt-secondary hover:bg-bg-surface"
                                    aria-label="Toggle sidebar">
                                    <LuPanelLeftClose
                                        size={24}
                                        className="text-lg"
                                    />
                                </button>
                            </div>
                            <p className="text-sm text-txt-secondary">
                                Discuss 3D printing topics
                            </p>
                        </div>

                        <div className="divider-top p-4 flex-1">
                            <nav className="space-y-1">
                                <Link
                                    to="/forum"
                                    onClick={handleSidebarClick}
                                    className="block rounded-md secondary-button">
                                    <div className="flex px-3 py-2 items-center">
                                        <MdHome size={20} className="mr-2" />
                                        <span>Home</span>
                                    </div>
                                </Link>

                                <div className="mt-4 mb-2">
                                    <h4 className="px-3 font-semibold text-txt-primary uppercase tracking-wider flex items-center">
                                        <BiSolidCategory
                                            size={20}
                                            className="mr-2"
                                        />
                                        Categories
                                    </h4>
                                </div>

                                {loading ? (
                                    <div className="animate-pulse space-y-2">
                                        {[...Array(5)].map((_, i) => (
                                            <div
                                                key={i}
                                                className="h-10 bg-bg-surface rounded-[10px]"
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-1 text-txt-secondary">
                                        {categories.map((category) => (
                                            <Link
                                                key={category.id}
                                                to={`/forum/category/${category.id}`}
                                                onClick={handleSidebarClick}
                                                className={`flex items-center px-3 py-2 rounded-[10px] ${
                                                    location.pathname ===
                                                    `/forum/category/${category.id}`
                                                        ? "bg-bg-surface text-txt-primary font-semibold"
                                                        : "hover:bg-bg-surface"
                                                }`}>
                                                {category.icon && (
                                                    <span className="mr-2 text-lg">
                                                        {category.icon}
                                                    </span>
                                                )}
                                                <span>{category.name}</span>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </nav>
                        </div>

                        <div className="p-4 divider-top">
                            <Link
                                to="/forum/new-thread"
                                onClick={handleSidebarClick}
                                className="block w-full py-2 px-4 text-center cta-button">
                                <div className="flex items-center justify-center">
                                    <FaPlusSquare size={20} className="mr-2" />
                                    <span>New Thread</span>
                                </div>
                            </Link>
                        </div>
                    </section>
                </div>
            </div>

            {/* Main content */}
            <div
                className={`flex-1 mt-2 p-4 transition-all duration-200 ${
                    isSidebarOpen ? "ml-[300px]" : "ml-[60px]"
                }`}>
                <Outlet />
            </div>
        </div>
    );
};
