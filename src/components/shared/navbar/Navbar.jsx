import { Link } from "react-router-dom";
import PropTypes from 'prop-types';
import { useState } from "react";

export const Navbar = ({ onLoginClick }) => {
    const [theme, setTheme] = useState(false)

    const changeTheme = () => {
        setTheme((prev) => {
            const newTheme = !prev;
            document.documentElement.dataset.theme = newTheme ? "dark" : "light";
            return newTheme;
        });
    };

    return (
        <header className="flex items-center justify-between bg-primary shadow-sm py-2 px-4">
            <button
                className="text-xl text-gray-700 md:hidden"
                aria-label="navigation"
            >
                <i className="fas fa-bars"></i>
            </button>

            <a
                href="/"
                className="flex items-center no-underline text-primary"
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

            <nav className="hidden md:block ml-4">
                <ul className="flex space-x-6">
                    <li>
                        <a
                            href="/explore"
                            className="text-txSecondary hover:text-primary transition-colors"
                        >
                            Explore
                        </a>
                    </li>
                    <li>
                        <a
                            href="/3dstore"
                            className="text-txSecondary hover:text-primary transition-colors"
                        >
                            Buy 3D Models
                        </a>
                    </li>
                    <li>
                        <a
                            href="/business"
                            className="text-txSecondary hover:text-primary transition-colors"
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
                    className="border border-gray-300 rounded-md w-full pl-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <i className="fas fa-search absolute right-2 text-gray-400"></i>
            </div>

            <div className="flex items-center space-x-4">
                <button className="border border-primary text-primary px-3 py-1 rounded-md cursor-pointer" onClick={changeTheme}>
                    Theme
                </button>
                <button
                    className="border border-primary text-primary font-semibold px-3 py-1 
                     rounded-md hover:bg-primary hover:text-white cursor-pointer
                     transition-colors"
                    onClick={onLoginClick}
                >
                    Login
                </button>
                <Link
                    to="/upload"
                    className="bg-primary text-white font-semibold px-3 py-1 
                     rounded-md hover:bg-hvPrimary transition-colors"
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
