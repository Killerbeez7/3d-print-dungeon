import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";

// hooks
import { useAuth } from "@/hooks/useAuth";
import { useSearch } from "@/hooks/useSearch";
import { useClickOutside } from "@/hooks/useClickOutside";

// configs
import { NAV_SECTIONS } from "@/config/navConfig";
import { STATIC_ASSETS } from "@/config/assetsConfig";

// components
import { AuthButtons } from "./AuthButtons";

import {
    MdFileUpload,
    MdAccountCircle,
    MdMenu,
    MdClose,
    MdNotifications,
    MdSearch,
} from "react-icons/md";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faSignOutAlt,
    faUser,
    faCog,
    faChevronDown,
} from "@fortawesome/free-solid-svg-icons";

import { GlobalSearch } from "../../search/GlobalSearch";

export const Navbar = ({ onLoginClick, onSignUpClick }) => {
    const { currentUser, handleSignOut, isAdmin } = useAuth();
    const { setShowDropdown } = useSearch();

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [mobileDropdown, setMobileDropdown] = useState(null);
    const [isSearchVisible, setIsSearchVisible] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const dropdownRef = useRef(null); //desktop dropdown
    const mobileDropdownRef = useRef(null); //mobile dropdown
    const searchOverlayRef = useRef(null); //search overlay

    /* ---------- helpers ---------- */

    const closeAll = () => {
        setActiveDropdown(null);
        setMobileDropdown(null);
        setIsMobileMenuOpen(false);
        setIsSearchVisible(false);
        setShowDropdown(false);
    };

    const toggleDropdown = (dropdownName) => {
        if (activeDropdown === dropdownName) {
            setActiveDropdown(null);
        } else {
            setActiveDropdown(dropdownName);
        }
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
        if (isMobileMenuOpen) {
            setMobileDropdown(null);
        }
    };

    const toggleMobileDropdown = (dropdownName, e) => {
        e.stopPropagation();
        setMobileDropdown((prev) => (prev === dropdownName ? null : dropdownName));
    };

    const handleLogout = async () => {
        try {
            await handleSignOut();
            navigate("/");
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    const handleSearchClick = () => {
        navigate("/search?query=");
    };

    /* ---------- outside‑click & route‑change ---------- */

    useClickOutside(dropdownRef, () => {
        setActiveDropdown(null);
    });

    useClickOutside(mobileDropdownRef, () => {
        setMobileDropdown(null);
    });

    useClickOutside(searchOverlayRef, () => {
        setIsSearchVisible(false);
    });

    useEffect(() => {
        closeAll();
    }, [location.pathname, setShowDropdown]);

    /* ---------- render ---------- */

    return (
        <div className="sticky top-0 left-0 right-0 z-50">
            <nav className="glass-effect">
                <div className="mx-auto px-4 sm:px-6 py-5">
                    <div className="flex items-center h-10">
                        {/* ---------- LEFT: logo & desktop nav ---------- */}
                        <div className="flex items-center space-x-4 min-w-fit">
                            {/* mobile hamburger */}
                            <button
                                id="hamburger-button"
                                className="md:hidden p-[0.5px] rounded-lg hover:bg-gray-100"
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
                                        alt="Site Logo"
                                        className="h-9 w-auto"
                                    />
                                </Link>
                            </div>

                            {/* logo desktop */}
                            <div className="hidden md:block whitespace-nowrap flex-shrink-0 w-[50px]">
                                <Link to="/" className="flex items-center space-x-2 ml-2">
                                    <img
                                        src={STATIC_ASSETS.LOGO}
                                        alt="Site Logo"
                                        className="h-9 w-auto hover:h-10 transition-all duration-300"
                                    />
                                </Link>
                            </div>

                            {/* desktop nav */}
                            <nav className="hidden md:flex items-center space-x-6">
                                {NAV_SECTIONS.map((section) => (
                                    <div
                                        key={section.label}
                                        className="relative group"
                                        ref={dropdownRef}
                                        onMouseEnter={() =>
                                            setActiveDropdown(section.label)
                                        }
                                        onMouseLeave={() => setActiveDropdown(null)}
                                    >
                                        <button
                                            className="inline-flex items-center text-md text-txt-secondary hover:text-txt-primary group-hover:text-txt-highlighted whitespace-nowrap"
                                            onClick={() => toggleDropdown(section.label)}
                                        >
                                            {section.label}
                                        </button>
                                        {/* Desktop Dropdown */}
                                        <div
                                            className={`absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-bg-surface ring-1 ring-black ring-opacity-5 transition-all duration-200 overflow-hidden ${
                                                activeDropdown === section.label
                                                    ? "opacity-100 visible"
                                                    : "opacity-0 invisible"
                                            }`}
                                        >
                                            <div>
                                                {section.items.map((item) => (
                                                    <Link
                                                        key={item.to}
                                                        to={item.to}
                                                        className="block px-4 py-2 text-md text-txt-secondary hover:bg-bg-secondary hover:text-txt-primary hover:overflow-hidden"
                                                        onClick={() =>
                                                            setActiveDropdown(null)
                                                        }
                                                    >
                                                        {item.label}
                                                    </Link>
                                                ))}
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
                                onClick={handleSearchClick}
                                className="hidden md:block lg:hidden text-txt-secondary hover:text-txt-primary"
                                title="Search"
                            >
                                <MdSearch className="h-7 w-7" />
                            </button>

                            {!currentUser ? (
                                <AuthButtons
                                    onLoginClick={onLoginClick}
                                    onSignUpClick={onSignUpClick}
                                />
                            ) : (
                                <>
                                    {/* Desktop buttons */}
                                    <div className="hidden md:flex items-center space-x-4">
                                        <Link
                                            to="/model/upload"
                                            className="text-txt-secondary hover:text-txt-primary"
                                            title="Upload Model:desktop"
                                        >
                                            <MdFileUpload className="h-7 w-7" />
                                        </Link>

                                        <Link
                                            to="/notifications"
                                            className="text-txt-secondary hover:text-txt-primary"
                                            title="Notifications"
                                        >
                                            <MdNotifications className="h-7 w-7" />
                                        </Link>
                                    </div>

                                    {/* Profile Dropdown */}
                                    <div className="relative" ref={dropdownRef}>
                                        <button
                                            onClick={() => toggleDropdown("profile")}
                                            className="flex items-center text-txt-secondary hover:text-txt-primary"
                                        >
                                            <MdAccountCircle className="h-7 w-7" />
                                        </button>
                                        
                                        {/*Profile Dropdown Options*/}
                                        <div
                                            className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-bg-surface ring-1 ring-black ring-opacity-5 transition-all duration-200 z-60 ${
                                                activeDropdown === "profile"
                                                    ? "opacity-100 visible"
                                                    : "opacity-0 invisible"
                                            }`}
                                        >
                                            <div className="py-1 z-60">
                                                <div className="px-4 py-2 text-md text-txt-muted border-b border-br-secondary">
                                                    {currentUser?.displayName ||
                                                        "Username"}
                                                </div>
                                                {isAdmin && (
                                                    <Link
                                                        to={`/admin-panel`}
                                                        className="block px-4 py-2 text-md text-txt-secondary hover:bg-bg-secondary hover:text-txt-primary"
                                                        onClick={() =>
                                                            setActiveDropdown(null)
                                                        }
                                                    >
                                                        <FontAwesomeIcon
                                                            icon={faUser}
                                                            className="mr-2"
                                                        />
                                                        Admin Dashboard
                                                    </Link>
                                                )}
                                                <Link
                                                    to={`/artist/${currentUser?.uid}`}
                                                    className="block px-4 py-2 text-md text-txt-secondary hover:bg-bg-secondary hover:text-txt-primary"
                                                    onClick={() =>
                                                        setActiveDropdown(null)
                                                    }
                                                >
                                                    <FontAwesomeIcon
                                                        icon={faUser}
                                                        className="mr-2"
                                                    />
                                                    Profile
                                                </Link>
                                                <Link
                                                    to="/settings"
                                                    className="block px-4 py-2 text-md text-txt-secondary hover:bg-bg-secondary hover:text-txt-primary"
                                                    onClick={() =>
                                                        setActiveDropdown(null)
                                                    }
                                                >
                                                    <FontAwesomeIcon
                                                        icon={faCog}
                                                        className="mr-2"
                                                    />
                                                    Settings
                                                </Link>
                                                <button
                                                    onClick={() => {
                                                        setActiveDropdown(null);
                                                        handleLogout();
                                                    }}
                                                    className="w-full text-left px-4 py-2 text-md text-txt-secondary hover:bg-bg-secondary hover:text-txt-primary"
                                                >
                                                    <FontAwesomeIcon
                                                        icon={faSignOutAlt}
                                                        className="mr-2"
                                                    />
                                                    Sign Out
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* ---------- Search overlay (mobile) ---------- */}
                    <div
                        ref={searchOverlayRef}
                        className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-200 ${
                            isSearchVisible
                                ? "opacity-100 pointer-events-auto"
                                : "opacity-0 pointer-events-none"
                        }`}
                    >
                        <div className="absolute top-0 left-0 right-0 bg-bg-primary p-4 shadow-lg transform transition-transform duration-200">
                            <div className="max-w-3xl mx-auto">
                                <GlobalSearch />
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* ---------- Mobile drawer ---------- */}
            <div
                className={`md:hidden shadow-md border-t border-br-secondary glass-effect absolute inset-x-0 transition-all duration-300 ease-in-out transform ${
                    isMobileMenuOpen
                        ? "translate-y-0 opacity-100 pointer-events-auto"
                        : "-translate-y-full opacity-0 pointer-events-none"
                }`}
                style={{ top: "100%" }}
            >
                {/* Mobile action buttons */}
                {currentUser && (
                    <div className="flex items-center justify-center space-x-8 p-4 border-b border-br-secondary">
                        <Link
                            to="/model/upload"
                            className="text-txt-secondary hover:text-txt-primary"
                            title="Upload Model:mobile"
                        >
                            <MdFileUpload className="h-7 w-7" />
                        </Link>

                        <Link
                            to="/notifications"
                            className="text-txt-secondary hover:text-txt-primary"
                            title="Notifications"
                        >
                            <MdNotifications className="h-7 w-7" />
                        </Link>
                    </div>
                )}

                {/* Mobile Search */}
                <div
                    className="p-4 border-b border-br-secondary"
                    onClick={() => setShowDropdown(false)}
                >
                    <GlobalSearch />
                </div>

                <div className="px-2 pt-2 h-auto pb-3 space-y-1" ref={mobileDropdownRef}>
                    {NAV_SECTIONS.map((section) => (
                        <div key={section.label}>
                            <button
                                className="w-full text-left px-4 py-2 text-txt-secondary hover:bg-bg-secondary hover:text-txt-primary flex items-center justify-between"
                                onClick={(e) => toggleMobileDropdown(section.label, e)}
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
                                className={`bg-bg-secondary transition-all duration-200 rounded-md ${
                                    mobileDropdown === section.label
                                        ? "max-h-48 overflow-y-auto"
                                        : "max-h-0 overflow-hidden"
                                }`}
                            >
                                {section.items.map((item) => (
                                    <Link
                                        key={item.to}
                                        to={item.to}
                                        className="block px-6 py-2 text-md text-txt-secondary hover:bg-bg-surface hover:text-txt-primary"
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

Navbar.propTypes = {
    onLoginClick: PropTypes.func.isRequired,
    onSignUpClick: PropTypes.func.isRequired,
};
