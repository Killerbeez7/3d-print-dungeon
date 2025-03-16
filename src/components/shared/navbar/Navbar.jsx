import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { useTheme } from "../../../utils/theme";
import { useAuth } from "../../../contexts/authContext";

export const Navbar = ({ onLoginClick }) => {
    const [theme, toggleTheme] = useTheme();
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
                            className="text-txt-secondary hover:text-txt-highlighted px-3 py-2 inline-block"
                        >
                            Explore
                        </Link>
                        <div
                            className="
                                absolute left-0 top-full 
                                hidden group-hover:block 
                                bg-bg-surface border border-br-primary 
                                rounded shadow-lg min-w-[150px]
                                z-10
                            "
                        >
                            <ul className="py-2">
                                <li>
                                    <Link
                                        to="/gallery"
                                        className="block px-4 py-2 text-txt-secondary hover:bg-bg-secondary hover:text-txt-primary transition-colors"
                                    >
                                        Gallery
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/artists"
                                        className="block px-4 py-2 text-txt-secondary hover:bg-bg-secondary hover:text-txt-primary transition-colors"
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
                            className="text-txt-secondary hover:text-txt-highlighted px-3 py-2 inline-block"
                        >
                            Buy 3D Models
                        </Link>
                        <div
                            className="
                                absolute left-0 top-full 
                                hidden group-hover:block 
                                bg-bg-surface border border-br-primary 
                                rounded shadow-lg min-w-[150px]
                                z-10
                            "
                        >
                            <ul className="py-2">
                                <li>
                                    <Link
                                        to="/3dstore/all"
                                        className="block px-4 py-2 text-txt-secondary hover:bg-bg-secondary hover:text-txt-primary transition-colors"
                                    >
                                        All Models
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/3dstore/featured"
                                        className="block px-4 py-2 text-txt-secondary hover:bg-bg-secondary hover:text-txt-primary transition-colors"
                                    >
                                        Featured
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/3dstore/new"
                                        className="block px-4 py-2 text-txt-secondary hover:bg-bg-secondary hover:text-txt-primary transition-colors"
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
                            className="text-txt-secondary hover:text-txt-highlighted px-3 py-2 inline-block"
                        >
                            For Business
                        </Link>
                        <div
                            className="
                                absolute left-0 top-full 
                                hidden group-hover:block 
                                bg-bg-surface border border-br-primary 
                                rounded shadow-lg min-w-[150px]
                                z-10
                            "
                        >
                            <ul className="py-2">
                                <li>
                                    <Link
                                        to="/business/bulk-orders"
                                        className="block px-4 py-2 text-txt-secondary hover:bg-bg-secondary hover:text-txt-primary transition-colors"
                                    >
                                        Bulk Orders
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/business/custom-solutions"
                                        className="block px-4 py-2 text-txt-secondary hover:bg-bg-secondary hover:text-txt-primary transition-colors"
                                    >
                                        Custom Solutions
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/business/enterprise"
                                        className="block px-4 py-2 text-txt-secondary hover:bg-bg-secondary hover:text-txt-primary transition-colors"
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
                <button
                    className="border-2 border-br-primary text-txt-primary font-medium px-3 py-1 rounded-lg cursor-pointer"
                    onClick={toggleTheme}
                >
                    Theme
                </button>

                {currentUser ? (
                    <button
                        className="bg-btn-secondary text-txt-primary font-medium px-3 py-1 rounded-lg hover:bg-btn-secondary-hover cursor-pointer"
                        onClick={handleSignOut}
                    >
                        Logout
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
        </header>
    );
};

Navbar.propTypes = {
    onLoginClick: PropTypes.func.isRequired,
};
