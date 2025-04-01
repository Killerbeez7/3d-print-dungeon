// src/components/shared/navbar/Navbar.jsx

import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { useAuth } from "../../../contexts/authContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MdFileUpload, MdAccountCircle } from "react-icons/md";

import {
    faUserCircle,
    faSignOutAlt,
    faUser,
    faCog,
    faList,
} from "@fortawesome/free-solid-svg-icons";

import { GlobalSearch } from "../../search/GlobalSearch";

export const Navbar = ({ onLoginClick }) => {
    const { currentUser, handleSignOut } = useAuth();

    // Helper to disable default link nav
    const disableClick = (e) => {
        e.preventDefault();
    };

    return (
        <header
            className="
        sticky top-0 z-50 bg-bg-primary py-5 px-4 
        grid grid-cols-3 items-center
      "
        >
            {/* LEFT COLUMN: Logo & Desktop Nav */}
            <div className="flex items-center space-x-4">
                {/* Mobile Toggle (icon) */}
                <button
                    className="text-xl bg-btn-primary md:hidden"
                    aria-label="navigation"
                >
                    <i className="fas fa-bars"></i>
                </button>

                {/* Logo / Brand */}
                <Link
                    to="/"
                    className="flex items-center no-underline text-btn-primary hover:text-btn-primary-hover space-x-2"
                    aria-label="Go to main page"
                >
                    <img
                        src="/logo.png"
                        alt="Site Logo"
                        className="w-10 h-auto"
                        loading="lazy"
                    />
                    {/* <span className="hidden sm:inline font-bold text-lg">
                        3D PRINT DUNGEON
                    </span> */}
                </Link>

                {/* Desktop Nav (Explore, Shop, etc.) */}
                <nav className="hidden md:flex ml-4">
                    <ul className="flex items-center space-x-6 font-medium relative">
                        <li className="relative group">
                            <Link
                                to="/explore"
                                onClick={disableClick}
                                className="text-txt-secondary group-hover:text-txt-highlighted px-3 py-2 inline-block"
                            >
                                Explore
                            </Link>
                            <div className="absolute left-0 top-full hidden group-hover:block bg-bg-surface border border-br-primary rounded-md shadow-lg min-w-[150px] z-10">
                                <ul className="py-2">
                                    <li>
                                        <Link
                                            to="/"
                                            className="block mx-2 px-2 my-1 py-1 text-txt-secondary rounded hover:bg-bg-secondary hover:text-txt-primary"
                                        >
                                            Models
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to="/artists"
                                            className="block mx-2 px-2 my-1 py-1 text-txt-secondary rounded hover:bg-bg-secondary hover:text-txt-primary"
                                        >
                                            Artists
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to="/forum"
                                            className="block mx-2 px-2 my-1 py-1 text-txt-secondary rounded hover:bg-bg-secondary hover:text-txt-primary"
                                        >
                                            Forum
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </li>

                        <li className="relative group">
                            <Link
                                to="/3dstore"
                                onClick={disableClick}
                                className="text-txt-secondary group-hover:text-txt-highlighted px-3 py-2 inline-block"
                            >
                                Shop
                            </Link>
                            <div className="absolute left-0 top-full hidden group-hover:block bg-bg-surface border border-br-primary rounded-md shadow-lg min-w-[150px] z-10">
                                <ul className="py-2">
                                    <li>
                                        <Link
                                            to="/3dstore/all"
                                            className="block mx-2 px-2 my-1 py-1 text-txt-secondary rounded hover:bg-bg-secondary hover:text-txt-primary"
                                        >
                                            All Models
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to="/3dstore/featured"
                                            className="block mx-2 px-2 my-1 py-1 text-txt-secondary rounded hover:bg-bg-secondary hover:text-txt-primary"
                                        >
                                            Featured
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to="/3dstore/new"
                                            className="block mx-2 px-2 my-1 py-1 text-txt-secondary rounded hover:bg-bg-secondary hover:text-txt-primary"
                                        >
                                            New Arrivals
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </li>

                        <li className="relative group">
                            <Link
                                to="/business"
                                onClick={disableClick}
                                className="text-txt-secondary group-hover:text-txt-highlighted px-3 py-2 inline-block"
                            >
                                For Business
                            </Link>
                            <div className="absolute left-0 top-full hidden group-hover:block bg-bg-surface border border-br-primary rounded-md shadow-lg min-w-[150px] z-10">
                                <ul className="py-2">
                                    <li>
                                        <Link
                                            to="/business/bulk-orders"
                                            className="block mx-2 px-2 my-1 py-1 text-txt-secondary rounded hover:bg-bg-secondary hover:text-txt-primary"
                                        >
                                            Orders
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to="/business/custom-solutions"
                                            className="block mx-2 px-2 my-1 py-1 text-txt-secondary rounded hover:bg-bg-secondary hover:text-txt-primary"
                                        >
                                            Solutions
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to="/business/enterprise"
                                            className="block mx-2 px-2 my-1 py-1 text-txt-secondary rounded hover:bg-bg-secondary hover:text-txt-primary"
                                        >
                                            Enterprise
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </li>
                    </ul>
                </nav>
            </div>

            {/* MIDDLE COLUMN: Search Bar */}
            <div className="flex justify-center">
                <GlobalSearch />
            </div>

            {/* RIGHT COLUMN: Auth Buttons, Profile, etc. */}
            <div className="flex items-center space-x-4 justify-end">
                {!currentUser ? (
                    <button
                        className="bg-btn-secondary text-txt-primary font-medium px-3 py-1 rounded-lg hover:bg-btn-secondary-hover cursor-pointer"
                        onClick={onLoginClick}
                    >
                        Sign In
                    </button>
                ) : null}
                <Link
                    to="/upload"
                    className=" text-txt-secondary font-medium px-3 py-1 rounded-lg hover:bg-btn-primary-hover"
                >
                    <MdFileUpload className="w-8 h-auto" />
                </Link>
                {/* <Link
                    to="/upload"
                    className="bg-btn-primary text-white font-medium px-3 py-1 rounded-lg hover:bg-btn-primary-hover"
                >
                    Upload
                </Link> */}

                {currentUser && (
                    <div className="relative group">
                        <button className="flex items-center text-btn-secondary group-hover:text-btn-secondary-hover">
                            {/* <FontAwesomeIcon icon={faUserCircle} className="text-3xl" /> */}
                            <MdAccountCircle className="w-8 h-auto" />
                        </button>

                        <div className="absolute right-[-10px] top-full hidden group-hover:block font-medium bg-bg-surface border border-br-primary rounded-md shadow-lg min-w-[180px] z-10">
                            <ul className="py-2">
                                <li className="px-4 py-1 text-txt-muted text-lg">
                                    {currentUser?.displayName || "Username"}
                                </li>
                                <li className="border-t border-br-secondary mx-4"></li>
                                <li>
                                    <Link
                                        to={`/artist/${currentUser?.uid}`}
                                        className="block mx-2 px-2 my-1 py-1 text-txt-secondary rounded hover:bg-bg-secondary hover:text-txt-primary"
                                        aria-label="View Profile"
                                    >
                                        <FontAwesomeIcon icon={faUser} className="mr-2" />
                                        Profile
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/profile"
                                        className="block mx-2 px-2 my-1 py-1 text-txt-secondary rounded hover:bg-bg-secondary hover:text-txt-primary"
                                        aria-label="Order History"
                                    >
                                        <FontAwesomeIcon icon={faList} className="mr-2" />
                                        Order History
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/settings"
                                        className="block mx-2 px-2 my-1 py-1 text-txt-secondary rounded hover:bg-bg-secondary hover:text-txt-primary"
                                        aria-label="Profile Settings"
                                    >
                                        <FontAwesomeIcon icon={faCog} className="mr-2" />
                                        Settings
                                    </Link>
                                </li>
                                <li>
                                    <button
                                        onClick={handleSignOut}
                                        className="block min-w-[150px] cursor-pointer text-left mx-2 px-2 my-1 py-1 text-txt-secondary rounded hover:bg-bg-secondary hover:text-txt-primary"
                                        aria-label="Logout"
                                    >
                                        <FontAwesomeIcon
                                            icon={faSignOutAlt}
                                            className="mr-2"
                                        />
                                        Logout
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};

Navbar.propTypes = {
    onLoginClick: PropTypes.func.isRequired,
};
