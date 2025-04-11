import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { useAuth } from "../../../contexts/authContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    MdFileUpload,
    MdAccountCircle,
    MdMenu,
    MdClose,
    MdNotifications,
    MdSearch,
} from "react-icons/md";
import { useClickOutside } from "../../../hooks/useClickOutside";

import {
    faSignOutAlt,
    faUser,
    faCog,
    faChevronDown,
} from "@fortawesome/free-solid-svg-icons";

import { GlobalSearch } from "../../search/GlobalSearch";

export const Navbar = ({ onLoginClick }) => {
    const { currentUser, handleSignOut } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [mobileDropdown, setMobileDropdown] = useState(null);
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const dropdownRef = useRef(null);
    const mobileDropdownRef = useRef(null);
    const searchOverlayRef = useRef(null);

    // Close desktop dropdown when clicking outside
    useClickOutside(dropdownRef, () => {
        setActiveDropdown(null);
    });

    // Close mobile dropdown when clicking outside
    useClickOutside(mobileDropdownRef, () => {
        setMobileDropdown(null);
    });

    // Close search overlay when clicking outside
    useClickOutside(searchOverlayRef, () => {
        setIsSearchVisible(false);
    });

    // Close dropdowns and mobile menu and search on route change
    useEffect(() => {
        setActiveDropdown(null);
        setMobileDropdown(null);
        setIsMobileMenuOpen(false);
        setIsSearchVisible(false);
    }, [location.pathname]);

    const handleLogout = async () => {
        try {
            await handleSignOut();
            navigate("/");
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
        if (isMobileMenuOpen) {
            setMobileDropdown(null);
        }
    };

    const toggleDropdown = (dropdownName) => {
        if (activeDropdown === dropdownName) {
            setActiveDropdown(null);
        } else {
            setActiveDropdown(dropdownName);
        }
    };

    const toggleMobileDropdown = (dropdownName, e) => {
        e.stopPropagation();
        setMobileDropdown((prev) => (prev === dropdownName ? null : dropdownName));
    };
 
    const handleSearchClick = () => {
        navigate("/search?query=");
    };

    const navItems = [
        {
            name: "Explore",
            path: "/explore",
            dropdownItems: [
                { name: "Models", path: "/" },
                { name: "Artists", path: "/explore/artists" },
                { name: "Forum", path: "/explore/forum" },
            ],
        },
        {
            name: "Shop",
            path: "/store",
            dropdownItems: [
                { name: "All Models", path: "/store" },
                { name: "Featured", path: "/store/featured" },
                { name: "New Arrivals", path: "/store/new" },
            ],
        },
        {
            name: "Business",
            path: "/business",
            dropdownItems: [
                { name: "Bulk Orders", path: "/business/bulk-orders" },
                { name: "Custom Solutions", path: "/business/custom-solutions" },
                { name: "Enterprise", path: "/business/enterprise" },
            ],
        },
    ];

    return (
        <div className="relative">
            <nav className="sticky top-0 z-50 bg-bg-primary">
                <div className="mx-auto px-4 sm:px-6 py-5">
                    <div className="flex items-center h-10">
                        {/* Left Section: Logo and Navigation */}
                        <div className="flex items-center space-x-4 w-1/4">
                            {/* Mobile menu button */}
                            <button
                                id="hamburger-button"
                                className="md:hidden p-2 rounded-lg hover:bg-gray-100"
                                onClick={toggleMobileMenu}
                                aria-label="Toggle mobile menu"
                                aria-expanded={isMobileMenuOpen}
                            >
                                {isMobileMenuOpen ? (
                                    <MdClose size={24} />
                                ) : (
                                    <MdMenu size={24} />
                                )}
                            </button>

                            {/* Logo - Mobile (Centered) */}
                            <div className="md:hidden absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap flex-shrink-0">
                                <Link to="/" className="flex items-center">
                                    <img
                                        src="/logo.png"
                                        alt="Site Logo"
                                        className="h-9 w-auto"
                                    />
                                </Link>
                            </div>

                            {/* Logo - Desktop (Left-aligned) */}
                            <div className="hidden md:block whitespace-nowrap flex-shrink-0">
                                <Link to="/" className="flex items-center space-x-2 ml-2">
                                    <img
                                        src="/logo.png"
                                        alt="Site Logo"
                                        className="h-9 w-auto"
                                    />
                                </Link>
                            </div>

                            {/* Desktop Navigation */}
                            <nav className="hidden md:flex items-center space-x-6">
                                {navItems.map((item) => (
                                    <div
                                        key={item.name}
                                        className="relative group"
                                        ref={dropdownRef}
                                        onMouseEnter={() => setActiveDropdown(item.name)}
                                        onMouseLeave={() => setActiveDropdown(null)}
                                    >
                                        <button
                                            className="inline-flex items-center text-md text-txt-secondary hover:text-txt-primary group-hover:text-txt-highlighted"
                                            onClick={() => toggleDropdown(item.name)}
                                        >
                                            {item.name}
                                            {/* <FontAwesomeIcon
                                                icon={faChevronDown}
                                                className="ml-1 h-3 w-3"
                                            /> */}
                                        </button>

                                        {/* Desktop Dropdown */}
                                        <div
                                            className={`absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-bg-surface ring-1 ring-black ring-opacity-5 transition-all duration-200 ${
                                                activeDropdown === item.name
                                                    ? "opacity-100 visible"
                                                    : "opacity-0 invisible"
                                            }`}
                                        >
                                            <div className="py-1">
                                                {item.dropdownItems.map(
                                                    (dropdownItem) => (
                                                        <Link
                                                            key={dropdownItem.path}
                                                            to={dropdownItem.path}
                                                            className="block px-4 py-2 text-md text-txt-secondary hover:bg-bg-secondary hover:text-txt-primary"
                                                            onClick={() =>
                                                                setActiveDropdown(null)
                                                            }
                                                        >
                                                            {dropdownItem.name}
                                                        </Link>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </nav>
                        </div>

                        {/* Center Section: Global Search */}
                        <div className="flex-1 flex justify-center px-4 max-w-5xl mx-auto w-1/2">
                            <div className="w-full hidden xl:block">
                                <GlobalSearch />
                            </div>
                        </div>

                        {/* Right Section: Auth & Profile */}
                        <div className="flex items-center space-x-4 justify-end w-1/4">
                            {!currentUser ? (
                                <button
                                    className="bg-btn-secondary text-txt-primary font-medium px-4 py-1.5 rounded-lg hover:bg-btn-secondary-hover text-md"
                                    onClick={onLoginClick}
                                >
                                    Sign In
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={handleSearchClick}
                                        className="hidden md:block xl:hidden text-txt-secondary hover:text-txt-primary"
                                        title="Search"
                                    >
                                        <MdSearch className="h-7 w-7" />
                                    </button>

                                    {/* Desktop buttons */}
                                    <div className="hidden md:flex items-center space-x-4">
                                        <Link
                                            to="/model/upload"
                                            className="text-txt-secondary hover:text-txt-primary"
                                            title="Upload Model"
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

                                    <div className="relative" ref={dropdownRef}>
                                        <button
                                            onClick={() => toggleDropdown("profile")}
                                            className="flex items-center text-txt-secondary hover:text-txt-primary"
                                        >
                                            <MdAccountCircle className="h-7 w-7" />
                                        </button>
                                        {/* Profile Dropdown */}
                                        <div
                                            className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-bg-surface ring-1 ring-black ring-opacity-5 transition-all duration-200 ${
                                                activeDropdown === "profile"
                                                    ? "opacity-100 visible"
                                                    : "opacity-0 invisible"
                                            }`}
                                        >
                                            <div className="py-1">
                                                <div className="px-4 py-2 text-md text-txt-muted border-b border-br-secondary">
                                                    {currentUser?.displayName ||
                                                        "Username"}
                                                </div>
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

                    {/* Search Overlay */}
                    <div
                        ref={searchOverlayRef}
                        className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-200 ${
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

            {/* Mobile Navigation Menu */}
            <div
                className={`md:hidden shadow-md absolute inset-x-0 bg-bg-primary transition-all duration-100 ease-out transform z-40 ${
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
                            title="Upload Model"
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
                <div className="p-4 border-b border-br-secondary">
                    <GlobalSearch />
                </div>

                <div className="px-2 pt-2 h-auto pb-3 space-y-1" ref={mobileDropdownRef}>
                    {navItems.map((item) => (
                        <div key={item.name}>
                            <button
                                className="w-full text-left px-4 py-2 text-txt-secondary hover:bg-bg-secondary hover:text-txt-primary flex items-center justify-between"
                                onClick={(e) => toggleMobileDropdown(item.name, e)}
                            >
                                {item.name}
                                <FontAwesomeIcon
                                    icon={faChevronDown}
                                    className={`ml-2 transform transition-transform duration-200 ${
                                        mobileDropdown === item.name ? "rotate-180" : ""
                                    }`}
                                />
                            </button>
                            <div
                                className={`bg-bg-secondary transition-all duration-200 ${
                                    mobileDropdown === item.name
                                        ? "max-h-48 overflow-y-auto"
                                        : "max-h-0 overflow-hidden"
                                }`}
                            >
                                {item.dropdownItems.map((dropdownItem) => (
                                    <Link
                                        key={dropdownItem.path}
                                        to={dropdownItem.path}
                                        className="block px-6 py-2 text-md text-txt-secondary hover:bg-bg-surface hover:text-txt-primary"
                                        onClick={() => {
                                            setIsMobileMenuOpen(false);
                                            setMobileDropdown(null);
                                        }}
                                    >
                                        {dropdownItem.name}
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
};
