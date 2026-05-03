import { useState, useRef, useEffect, RefObject, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
// hooks
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useUserRole } from "@/features/auth/hooks/useUserRole";
import { useSearch } from "@/features/search/hooks/useSearch";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useModal } from "@/hooks/useModal"; // NEW
// configs
import { NAV_SECTIONS } from "@/config/navConfig";
import { STATIC_ASSETS } from "@/config/assetsConfig";
// components
import { AuthButtons } from "./AuthButtons";
import { GlobalSearch } from "@/features/search/components/GlobalSearch";
import { NotificationDropdown } from "@/features/user/notifications";
// icons
import type { IconType } from "react-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    MdFileUpload,
    MdAccountCircle,
    MdMenu,
    MdClose,
    MdSearch,
    MdArticle,
    MdBusinessCenter,
    MdCollections,
    MdEvent,
    MdForum,
    MdInventory2,
    MdPeople,
    MdPrecisionManufacturing,
    MdPrint,
    MdStorefront,
    MdViewModule,
} from "react-icons/md";
import {
    faSignOutAlt,
    faUser,
    faCog,
    faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import type { NavSection } from "@/types/navbar";
import { toUrlSafeUsername } from "@/utils/stringUtils";

const navItemIcons: Record<string, IconType> = {
    Models: MdViewModule,
    Artists: MdPeople,
    Collections: MdCollections,
    Events: MdEvent,
    Forum: MdForum,
    Blog: MdArticle,
    Marketplace: MdStorefront,
    "Printed Figures": MdPrint,
    "Bulk Orders": MdInventory2,
    "Custom Solutions": MdPrecisionManufacturing,
    "Enterprise Suite": MdBusinessCenter,
};

export const Navbar = (): React.ReactNode => {
    const { isAdmin } = useUserRole();
    const { currentUser, publicProfile, handleSignOut, loading } = useAuth();
    const { setShowDropdown } = useSearch();
    const { open } = useModal("auth");

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [mobileDropdown, setMobileDropdown] = useState<string | null>(null);

    const navigate = useNavigate();
    const location = useLocation();
    const desktopNavRef = useRef<HTMLDivElement | null>(null);
    const profileDropdownRef = useRef<HTMLDivElement | null>(null);
    const mobileDropdownRef = useRef<HTMLDivElement | null>(null);

    // helpers
    const closeAll = useCallback((): void => {
        setActiveDropdown(null);
        setMobileDropdown(null);
        setIsMobileMenuOpen(false);
        setShowDropdown(false);
    }, [setShowDropdown]);

    const handleLogoClick = (): void => {
        if (location.pathname === "/") {
            window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
            navigate("/");
        }
    };

    const toggleDropdown = (dropdownName: string): void => {
        setActiveDropdown((prev) => (prev === dropdownName ? null : dropdownName));
    };

    const toggleMobileMenu = (): void => {
        setIsMobileMenuOpen((prev) => {
            if (prev) setMobileDropdown(null);
            return !prev;
        });
    };

    const toggleMobileDropdown = (
        dropdownName: string,
        e: React.MouseEvent<HTMLButtonElement>
    ): void => {
        e.stopPropagation();
        setMobileDropdown((prev) => (prev === dropdownName ? null : dropdownName));
    };

    const handleLogout = async (): Promise<void> => {
        try {
            await handleSignOut();
            navigate("/");
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    const handleSearchClick = (): void => {
        navigate("/search?query=");
    };

    // Outside click and route change cleanup.

    useClickOutside(desktopNavRef as RefObject<HTMLElement>, () => {
        setActiveDropdown((prev) => (prev === "profile" ? prev : null));
    });

    useClickOutside(profileDropdownRef as RefObject<HTMLElement>, () => {
        setActiveDropdown((prev) => (prev === "profile" ? null : prev));
    });

    useClickOutside(mobileDropdownRef as RefObject<HTMLElement>, () => {
        setMobileDropdown(null);
    });

    useEffect(() => {
        closeAll();
    }, [closeAll, location.pathname]);

    const urlSafeUsername = toUrlSafeUsername(publicProfile?.username);

    return (
        <div className="sticky top-0 left-0 right-0 z-50">
            <nav className="bg-bg-section/95 border-b border-br-subtle shadow-sm backdrop-blur-md relative z-50">
                <div className="mx-auto px-4 sm:px-6 py-5">
                    <div className="flex items-center h-10">
                        {/* LEFT: logo & desktop nav */}
                        <div className="flex items-center space-x-4 min-w-fit">
                            {/* mobile hamburger */}
                            <button
                                id="hamburger-button"
                                type="button"
                                className="md:hidden p-[0.5px] rounded-lg text-txt-secondary hover:bg-bg-surface"
                                onClick={toggleMobileMenu}
                                aria-label="Toggle mobile menu"
                                aria-expanded={isMobileMenuOpen}
                            >
                                {isMobileMenuOpen ? (
                                    <MdClose size={30} />
                                ) : (
                                    <MdMenu size={30} />
                                )}
                            </button>

                            {/* logo mobile */}
                            <div className="md:hidden absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap flex-shrink-0">
                                <Link to="/" className="flex items-center">
                                    <img
                                        src={STATIC_ASSETS.LOGO}
                                        alt="3D Print Dungeon"
                                        className="h-9 w-auto logo-accent"
                                    />
                                </Link>
                            </div>

                            {/* logo desktop */}
                            <div className="hidden md:block whitespace-nowrap flex-shrink-0 w-[50px]">
                                <Link
                                    to="/"
                                    className="flex items-center space-x-2 ml-2"
                                    onClick={handleLogoClick}
                                >
                                    <img
                                        src={STATIC_ASSETS.LOGO}
                                        alt="3D Print Dungeon"
                                        className="h-9 w-auto transition-transform duration-200 hover:scale-105 logo-accent"
                                    />
                                </Link>
                            </div>

                            {/* desktop nav */}
                            <nav
                                ref={desktopNavRef}
                                className="hidden md:flex items-center space-x-5"
                                aria-label="Primary navigation"
                            >
                                {(NAV_SECTIONS as NavSection[]).map((section) => (
                                    <div
                                        key={section.label}
                                        className="relative group"
                                        onMouseEnter={() =>
                                            setActiveDropdown(section.label)
                                        }
                                        onMouseLeave={() => setActiveDropdown(null)}
                                    >
                                        <button
                                            type="button"
                                            className={`relative inline-flex h-10 items-center whitespace-nowrap px-1 text-md transition-colors duration-200 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:bg-[var(--accent)] after:transition-opacity after:duration-200 hover:text-txt-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${
                                                activeDropdown === section.label
                                                    ? "text-txt-primary after:opacity-100"
                                                    : "text-txt-secondary after:opacity-0 group-hover:after:opacity-100"
                                            }`}
                                            onClick={() => toggleDropdown(section.label)}
                                            aria-haspopup="menu"
                                            aria-expanded={activeDropdown === section.label}
                                        >
                                            {section.label}
                                        </button>
                                        {/* Desktop Dropdown */}
                                        <div
                                            role="menu"
                                            className={`absolute left-0 mt-2 w-52 rounded-lg shadow-lg bg-surface-elevated border border-br-secondary transition-all duration-200 p-2 z-40 ${
                                                activeDropdown === section.label
                                                    ? "opacity-100 visible"
                                                    : "opacity-0 invisible"
                                            }`}
                                        >
                                            <div>
                                                {section.items.map((item) => {
                                                    const ItemIcon = navItemIcons[item.label];

                                                    return (
                                                        <Link
                                                            key={item.to}
                                                            to={item.to}
                                                            role="menuitem"
                                                            className="group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-txt-secondary hover:bg-bg-surface hover:text-txt-primary hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-br-primary"
                                                            onClick={() =>
                                                                setActiveDropdown(null)
                                                            }
                                                        >
                                                            {ItemIcon && (
                                                                <ItemIcon
                                                                    className="h-4 w-4 flex-shrink-0 text-txt-secondary transition-colors group-hover:text-txt-primary"
                                                                    aria-hidden="true"
                                                                />
                                                            )}
                                                            <span>{item.label}</span>
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </nav>
                        </div>

                        {/* ---------- CENTER: global search ---------- */}
                        <div className="flex-1 flex justify-center px-4 max-w-6xl mx-auto w-1/2">
                            <div className="w-full hidden lg:block">
                                <GlobalSearch />
                            </div>
                        </div>

                        {/* ---------- RIGHT: auth & icons ---------- */}
                        <div className="flex items-center space-x-4 justify-end min-w-fit">
                            {/* Quick search icon */}
                            <button
                                type="button"
                                onClick={handleSearchClick}
                                className="hidden md:block lg:hidden rounded-lg p-1 text-txt-secondary hover:bg-bg-surface hover:text-txt-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-br-primary"
                                title="Search"
                                aria-label="Search"
                            >
                                <MdSearch className="h-7 w-7" />
                            </button>

                            {!currentUser ? (
                                <AuthButtons
                                    isLoading={loading}
                                    onLoginClick={() => open({ mode: "signin" })}
                                    onSignUpClick={() => open({ mode: "signup" })}
                                />
                            ) : (
                                <>
                                    {/* Desktop buttons */}
                                    <div className="hidden md:flex items-center space-x-4">
                                        <Link
                                            to="/model/upload"
                                            className="rounded-lg p-1 text-txt-secondary hover:bg-bg-surface hover:text-txt-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-br-primary"
                                            title="Upload Model"
                                            aria-label="Upload Model"
                                        >
                                            <MdFileUpload className="h-7 w-7" />
                                        </Link>

                                        <NotificationDropdown
                                            className="text-txt-secondary"
                                        />
                                    </div>

                                    {/* Profile Dropdown */}
                                    <div className="relative" ref={profileDropdownRef}>
                                        <button
                                            id="profile-button"
                                            type="button"
                                            onClick={() => toggleDropdown("profile")}
                                            className="flex items-center text-txt-secondary hover:text-txt-primary cursor-pointer transition-colors duration-200 p-1 rounded-lg hover:bg-bg-surface"
                                            aria-label="Profile menu"
                                            aria-haspopup="menu"
                                            aria-expanded={activeDropdown === "profile"}
                                        >
                                            <MdAccountCircle className="h-7 w-7" />
                                        </button>

                                        {/*Profile Dropdown Options*/}
                                        <div
                                            role="menu"
                                            className={`absolute right-0 mt-3 w-64 rounded-xl shadow-2xl bg-surface-elevated border border-br-secondary transition-all duration-300 transform origin-top-right z-40 ${
                                                activeDropdown === "profile"
                                                    ? "opacity-100 visible scale-100"
                                                    : "opacity-0 invisible scale-95"
                                            }`}
                                        >
                                            {/* Header with user info */}
                                            <div className="px-4 py-3 border-b border-br-secondary bg-gradient-to-r from-bg-primary to-bg-secondary rounded-t-xl">
                                                <h6 className="text-sm font-semibold text-txt-primary mb-1">
                                                    {currentUser?.displayName ||
                                                        "Username"}
                                                </h6>
                                                <p className="text-xs text-txt-secondary">
                                                    {currentUser?.email ||
                                                        "user@example.com"}
                                                </p>
                                            </div>

                                            {/* Menu items */}
                                            <div className="p-2">
                                                {isAdmin && (
                                                    <Link
                                                        to="/admin-dashboard"
                                                        role="menuitem"
                                                        className="flex items-center w-full px-3 py-2.5 text-sm text-txt-secondary hover:bg-bg-surface hover:text-txt-primary rounded-lg transition-all duration-200 hover:shadow-sm group"
                                                        onClick={() =>
                                                            setActiveDropdown(null)
                                                        }
                                                    >
                                                        <FontAwesomeIcon
                                                            icon={faUser}
                                                            className="mr-3 text-txt-secondary group-hover:text-txt-primary transition-colors"
                                                        />
                                                        <span className="font-medium">
                                                            Admin Dashboard
                                                        </span>
                                                    </Link>
                                                )}

                                                <Link
                                                    to={`/${urlSafeUsername}`}
                                                    role="menuitem"
                                                    className="flex items-center w-full px-3 py-2.5 text-sm text-txt-secondary hover:bg-bg-surface hover:text-txt-primary rounded-lg transition-all duration-200 hover:shadow-sm group"
                                                    onClick={() =>
                                                        setActiveDropdown(null)
                                                    }
                                                >
                                                    <FontAwesomeIcon
                                                        icon={faUser}
                                                        className="mr-3 text-txt-secondary group-hover:text-txt-primary transition-colors"
                                                    />
                                                    <span className="font-medium">
                                                        Profile
                                                    </span>
                                                </Link>

                                                <Link
                                                    to="/settings"
                                                    role="menuitem"
                                                    className="flex items-center w-full px-3 py-2.5 text-sm text-txt-secondary hover:bg-bg-surface hover:text-txt-primary rounded-lg transition-all duration-200 hover:shadow-sm group"
                                                    onClick={() =>
                                                        setActiveDropdown(null)
                                                    }
                                                >
                                                    <FontAwesomeIcon
                                                        icon={faCog}
                                                        className="mr-3 text-txt-secondary group-hover:text-txt-primary transition-colors"
                                                    />
                                                    <span className="font-medium">
                                                        Settings
                                                    </span>
                                                </Link>

                                                {/* Divider */}
                                                <div className="my-2 border-t border-br-secondary"></div>

                                                <button
                                                    type="button"
                                                    role="menuitem"
                                                    onClick={() => {
                                                        setActiveDropdown(null);
                                                        handleLogout();
                                                    }}
                                                    className="flex items-center w-full px-3 py-2.5 text-sm text-txt-secondary hover:bg-bg-surface hover:text-txt-primary rounded-lg transition-all duration-200 hover:shadow-sm group"
                                                >
                                                    <FontAwesomeIcon
                                                        icon={faSignOutAlt}
                                                        className="mr-3 text-txt-secondary group-hover:text-white transition-colors"
                                                    />
                                                    <span className="font-medium">
                                                        Sign Out
                                                    </span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile menu backdrop */}
            {isMobileMenuOpen && (
                <div 
                    className="md:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-20"
                    onClick={closeAll}
                />
            )}

            {/* ---------- Mobile drawer ---------- */}

            <div
                className={`md:hidden shadow-md divider-top bg-bg-section border-b border-br-subtle absolute inset-x-0 transition-all duration-300 ease-in-out transform z-30 ${
                    isMobileMenuOpen
                        ? "translate-y-0 opacity-100 pointer-events-auto"
                        : "-translate-y-full opacity-0 pointer-events-none"
                }`}
                style={{ top: "100%" }}
            >
                {/* Mobile action buttons */}
                {currentUser && (
                    <div className="flex items-center justify-center space-x-8 p-4">
                        <Link
                            to="/model/upload"
                            className="text-txt-secondary hover:text-txt-primary"
                            title="Upload Model"
                            aria-label="Upload Model"
                        >
                            <MdFileUpload className="h-7 w-7" />
                        </Link>

                        <NotificationDropdown
                            className="text-txt-secondary hover:text-txt-primary"
                        />
                    </div>
                )}

                {/* Mobile Search */}
                <div className="p-4 divider-top" onClick={() => setShowDropdown(false)}>
                    <GlobalSearch />
                </div>

                <div className="px-2 pt-2 h-auto pb-3 space-y-1" ref={mobileDropdownRef}>
                    {(NAV_SECTIONS as NavSection[]).map((section) => (
                        <div key={section.label}>
                            <button
                                type="button"
                                className={`w-full text-left px-4 py-2 text-txt-secondary hover:rounded-md hover:bg-bg-secondary hover:text-txt-primary flex items-center justify-between ${
                                    mobileDropdown === section.label
                                        ? "bg-bg-surface rounded-md text-txt-primary font-semibold"
                                        : ""
                                }`}
                                onClick={(e) => toggleMobileDropdown(section.label, e)}
                                aria-expanded={mobileDropdown === section.label}
                            >
                                {section.label}
                                <FontAwesomeIcon
                                    icon={faChevronDown}
                                    className={`ml-2 transform transition-transform duration-200 ${
                                        mobileDropdown === section.label
                                            ? "rotate-180"
                                            : ""
                                    }`}
                                />
                            </button>
                            <div
                                className={`transition-all duration-200 rounded-md ${
                                    mobileDropdown === section.label
                                        ? "max-h-48 overflow-y-auto"
                                        : "max-h-0 overflow-hidden"
                                }`}
                            >
                                {section.items.map((item) => (
                                    <Link
                                        key={item.to}
                                        to={item.to}
                                        className="block px-6 py-2 text-md text-txt-secondary hover:bg-bg-secondary hover:text-txt-primary"
                                        onClick={() => {
                                            setIsMobileMenuOpen(false);
                                            setMobileDropdown(null);
                                        }}
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
