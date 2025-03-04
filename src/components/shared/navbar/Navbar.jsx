export const Navbar = () => {
    return (
        <header className="flex items-center justify-between bg-bgPrimary shadow-sm px-4 py-2">
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
                    <circle cx="12.5" cy="12.5" r="12" fill="#1caad9" />
                </svg>
                <span className="ml-2 font-bold text-lg">3D PRINT DUNGEON</span>
            </a>

            <nav className="hidden md:block ml-4">
                <ul className="flex space-x-6">
                    <li>
                        <a
                            href="#"
                            className="text-gray-600 hover:text-blue-500 transition-colors"
                        >
                            Explore
                        </a>
                    </li>
                    <li>
                        <a
                            href="#"
                            className="text-gray-600 hover:text-blue-500 transition-colors"
                        >
                            Buy 3D Models
                        </a>
                    </li>
                    <li>
                        <a
                            href="#"
                            className="text-gray-600 hover:text-blue-500 transition-colors"
                        >
                            For Business
                        </a>
                    </li>
                </ul>
            </nav>

            <div className="hidden md:flex items-center relative mx-4">
                <input
                    type="text"
                    placeholder="Search 3D models"
                    className="border border-gray-300 rounded-md pl-3 pr-8 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <i className="fas fa-search absolute right-2 text-gray-400"></i>
            </div>

            <div className="flex items-center space-x-2">
                <a
                    href="/login"
                    className="border border-primary text-primary px-3 py-1 rounded-md hover:bg-primary hover:text-white transition-colors"
                >
                    Login
                </a>
                <a
                    href="/signup"
                    className="border border-primary text-primary px-3 py-1 rounded-md hover:bg-primary hover:text-white transition-colors"
                >
                    Sign Up
                </a>
                <a
                    href="/upload"
                    className="bg-primary text-white font-semibold px-3 py-1 rounded-md hover:bg-blue-500 transition-colors"
                >
                    <i className="fas fa-upload mr-1"></i>
                    Upload
                </a>
            </div>
        </header>
    );
};
