import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { useTheme } from "../../../utils/theme";
import { useAuth } from "../../../contexts/authContext";

export const Navbar = ({ onLoginClick }) => {
    const [theme, toggleTheme] = useTheme();

    const { currentUser, handleSignOut } = useAuth();

    return (
        <header className="flex items-cente justify-between bg-bg-primary shadow-sm py-2 px-4">
            <button
                className="text-xl bg-btn-primary md:hidden"
                aria-label="navigation"
            >
                <i className="fas fa-bars"></i>
            </button>

            <a
                href="/"
                className="flex items-center no-underline text-btn-primary hover:text-btn-primary-hover"
                aria-label="Go to main page"
            >
                <svg
                    width="40"
                    height="40"
                    viewBox="0 0 121 25"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <circle cx="12.5" cy="12.5" r="12" fill="#999999" />
                </svg>
                <span className="ml-2 font-bold text-lg">3D PRINT DUNGEON</span>
            </a>

            <nav className="hidden md:flex ml-4">
                <ul className="flex items-center space-x-6 font-medium">
                    <li>
                        <a
                            href="/explore"
                            className="text-txt-secondary hover:text-txt-highlighted"
                        >
                            Explore
                        </a>
                    </li>
                    <li>
                        <a
                            href="/3dstore"
                            className="text-txt-secondary hover:text-txt-highlighted"
                        >
                            Buy 3D Models
                        </a>
                    </li>
                    <li>
                        <a
                            href="/business"
                            className="text-txt-secondary hover:text-txt-highlighted"
                        >
                            For Business
                        </a>
                    </li>
                </ul>
            </nav>

            <div className="hidden md:flex items-center relative mx-4 w-[800px]">
                <input
                    type="text"
                    placeholder="Search 3D models"
                    className="border-2 border-br-primary text-txt-primary placeholder-txt-muted rounded-full w-full pl-4 py-1 focus:outline-none focus:border-focus focus:ring-focus"
                />
                <i className="fas fa-search absolute right-2 text-txt-secondary"></i>
            </div>

            <div className="flex items-center space-x-4">
                <button
                    className="border-2 border-br-primary text-txt-primary font-medium px-3 py-1 rounded-lg cursor-pointer"
                    onClick={toggleTheme}
                >
                    Theme
                </button>
                {currentUser ? (
                    <button
                        className="bg-btn-secondary text-txt-primary font-medium px-3 py-1 
                rounded-lg hover:bg-btn-secondary-hover cursor-pointer"
                        onClick={handleSignOut}
                    >
                        Logout
                    </button>
                ) : (
                    <button
                        className="bg-btn-secondary text-txt-primary font-medium px-3 py-1 
                     rounded-lg hover:bg-btn-secondary-hover cursor-pointer"
                        onClick={onLoginClick}
                    >
                        Sign In
                    </button>
                )}

                <Link
                    to="/upload"
                    className="bg-btn-primary text-white font-medium px-3 py-1 
                     rounded-lg hover:bg-btn-primary-hover"
                >
                    Upload
                </Link>
            </div>
        </header>
    );
};

// PropTypes validation for onLoginClick prop
Navbar.propTypes = {
    onLoginClick: PropTypes.func.isRequired,
};
