import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { useAuth } from "../../../contexts/authContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faUserCircle,
    faSignOutAlt,
    faUser,
    faCog,
    faList
} from "@fortawesome/free-solid-svg-icons";

export const Navbar = ({ onLoginClick }) => {
    const { currentUser, handleSignOut } = useAuth();

    // Helper to disable click navigation
    const disableClick = (e) => {
        e.preventDefault();
    };

    return (
        <header className="flex items-center justify-between bg-bg-primary shadow-sm py-2 px-4">
            {/* Mobile Nav Toggle (icon) */}
            <button
                className="text-xl bg-btn-primary md:hidden"
                aria-label="navigation"
            >
                <i className="fas fa-bars"></i>
            </button>

            {/* Logo / Brand */}
            <a
                href="/"
                className="flex items-center no-underline text-btn-primary hover:text-btn-primary-hover"
                aria-label="Go to main page"
            >
                <span className="ml-2 font-bold text-lg">3D PRINT DUNGEON</span>
            </a>

            {/* Navigation Links (Desktop) */}
            <nav className="hidden md:flex ml-4">
                <ul className="flex items-center space-x-6 font-medium relative">
                    {/* Explore with Dropdown */}
                    <li className="relative group">
                        <Link
                            to="/explore"
                            onClick={disableClick}
                            className="text-txt-secondary group-hover:text-txt-highlighted px-3 py-2 inline-block"
                        >
                            Explore
                        </Link>
                        <div
                            className="absolute left-0 top-full hidden group-hover:block bg-bg-surface border border-br-primary rounded-md shadow-lg min-w-[150px] z-10"
                        >
                            <ul className="py-2">
                                <li>
                                    <Link
                                        to="/gallery"
                                        className="block mx-2 px-2 my-1 py-1 text-txt-secondary rounded hover:bg-bg-secondary hover:text-txt-primary"
                                    >
                                        Gallery
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
                            </ul>
                        </div>
                    </li>

                    {/* Buy 3D Models with Dropdown */}
                    <li className="relative group">
                        <Link
                            to="/3dstore"
                            onClick={disableClick}
                            className="text-txt-secondary group-hover:text-txt-highlighted px-3 py-2 inline-block"
                        >
                            Buy 3D Models
                        </Link>
                        <div
                            className="absolute left-0 top-full hidden group-hover:block bg-bg-surface border border-br-primary rounded-md shadow-lg min-w-[150px] z-10"
                        >
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

                    {/* For Business with Dropdown */}
                    <li className="relative group">
                        <Link
                            to="/business"
                            onClick={disableClick}
                            className="text-txt-secondary group-hover:text-txt-highlighted px-3 py-2 inline-block"
                        >
                            For Business
                        </Link>
                        <div
                            className="absolute left-0 top-full hidden group-hover:block bg-bg-surface border border-br-primary rounded-md shadow-lg min-w-[150px] z-10"
                        >
                            <ul className="py-2">
                                <li>
                                    <Link
                                        to="/business/bulk-orders"
                                        className="block mx-2 px-2 my-1 py-1 text-txt-secondary rounded hover:bg-bg-secondary hover:text-txt-primary"
                                    >
                                        Bulk Orders
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/business/custom-solutions"
                                        className="block mx-2 px-2 my-1 py-1 text-txt-secondary rounded hover:bg-bg-secondary hover:text-txt-primary"
                                    >
                                        Custom Solutions
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

            {/* Search Bar */}
            <div className="hidden md:flex items-center relative mx-4 w-[800px]">
                <input
                    type="text"
                    placeholder="Search 3D models"
                    className="border-2 border-br-primary text-txt-primary placeholder-txt-muted rounded-full w-full pl-4 py-1 focus:outline-none focus:border-focus focus:ring-focus"
                />
                <i className="fas fa-search absolute right-2 text-txt-secondary"></i>
            </div>

            {/* Right Side: Theme / Auth / Upload */}
            <div className="flex items-center space-x-4">
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
                    className="bg-btn-primary text-white font-medium px-3 py-1 rounded-lg hover:bg-btn-primary-hover"
                >
                    Upload
                </Link>

                {currentUser ? (
                    <div className="relative group">
                        {/* Profile Icon and Dropdown */}
                        <button className="flex items-center text-btn-secondary group-hover:text-btn-secondary-hover">
                            <FontAwesomeIcon icon={faUserCircle} className="text-3xl" />
                        </button>

                        <div className="absolute right-[-10px] top-full hidden group-hover:block font-medium bg-bg-surface border border-br-primary rounded-md shadow-lg min-w-[180px] z-10">
                            <ul className="py-2">
                                {/* User Name - Not clickable */}
                                <li className="px-4 py-1 text-txt-muted text-lg">{currentUser?.displayName || "Username"}</li>

                                <li className="border-t border-br-secondary mx-4"></li>
                                
                                <li>
                                    <Link
                                        to="/profile"
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
                                        <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                                        Logout
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                ) : null}
            </div>

        </header>
    );
};

Navbar.propTypes = {
    onLoginClick: PropTypes.func.isRequired,
};


/*

<div className="flex items-center space-x-4">
{currentUser ? (
    <button
        className="bg-btn-secondary text-txt-primary font-medium px-3 py-1 rounded-lg hover:bg-btn-secondary-hover cursor-pointer"
        onClick={handleSignOut}
    >
        Sign Out
    </button>
    
) : (
    <button
        className="bg-btn-secondary text-txt-primary font-medium px-3 py-1 rounded-lg hover:bg-btn-secondary-hover cursor-pointer"
        onClick={onLoginClick}
    >
        Sign In
    </button>
)}

<Link
    to="/upload"
    className="bg-btn-primary text-white font-medium px-3 py-1 rounded-lg hover:bg-btn-primary-hover"
>
    Upload
</Link>
</div>
{currentUser ? (<div className="relative group">
<button className="flex items-center text-txt-secondary group-hover:text-txt-highlighted">
    <FontAwesomeIcon icon={faUserCircle} className="text-3xl" />
</button>

<div className="absolute right-[-10px] top-full hidden group-hover:block font-medium bg-bg-surface border border-br-primary rounded-md shadow-lg min-w-[150px] z-10">
    <ul className="py-2">
        <li>
            <Link to="/profile" className="block mx-2 px-2 my-1 py-1 text-txt-secondary rounded hover:bg-bg-secondary hover:text-txt-primary">
                <FontAwesomeIcon icon={faUser} className="mr-2" />
                Profile
            </Link>
        </li>
        <li>
            <Link to="/profile-settings" className="block mx-2 px-2 my-1 py-1 text-txt-secondary rounded hover:bg-bg-secondary hover:text-txt-primary">
                <FontAwesomeIcon icon={faCog} className="mr-2" />
                Settings
            </Link>
        </li>
        <li>
            <button onClick={handleSignOut} className="block min-w-[150px] cursor-pointer text-left mx-2 px-2 my-1 py-1 text-txt-secondary rounded hover:bg-bg-secondary hover:text-txt-primary">
                <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                Logout
            </button>
        </li>
    </ul>
</div>
</div>)
:
null}

*/