import { useState, FormEvent, ChangeEvent } from "react";
import {
    FaFacebook,
    FaTwitter,
    FaInstagram,
    FaLinkedin,
    FaDiscord,
    FaPinterest,
} from "react-icons/fa";
import { AlertModal } from "../AlertModal";
import { CookieSettingsModal } from "../../policies/components/CookieSettingsModal";
import { Link } from "react-router-dom";
import { ROUTES } from "@/constants/routeConstants";
import { FORUM_HOME_PATH } from "@/features/forum/constants/forumPaths";

export const Footer = () => {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [email, setEmail] = useState<string>("");
    const [showCookieSettings, setShowCookieSettings] = useState<boolean>(false);

    const handleSubscribe = (e: FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        setIsModalOpen(true);
        setEmail("");
    };

    const handleEmailChange = (e: ChangeEvent<HTMLInputElement>): void => {
        setEmail(e.target.value);
    };

    return (
        <>
            <footer className="text-txt-secondary bg-bg-secondary z-10 mt-30 min-h-[16rem]">
                {/* Footer Top Section */}
                <div className="pt-8 pb-6 sm:pt-15 sm:pb-10" role="footer-top">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Footer Top Section */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 lg:gap-8 text-center sm:text-left">
                            {/* EXPLORE Section */}
                            <div className="mb-4">
                                <h6 className="text-xs sm:text-sm font-bold text-txt-primary mb-2 sm:mb-3">
                                    EXPLORE
                                </h6>
                                <div className="flex flex-col gap-1">
                                    <Link
                                        to={ROUTES.HOME}
                                        className="text-sm sm:text-base py-2 px-1 hover:text-accent-hover transition-colors duration-300 min-h-[44px] flex items-center"
                                    >
                                        3D Models
                                    </Link>
                                    <Link
                                        to={ROUTES.ARTISTS_LIST}
                                        className="text-sm sm:text-base py-2 px-1 hover:text-accent-hover transition-colors duration-300 min-h-[44px] flex items-center"
                                    >
                                        Artists
                                    </Link>
                                    <Link
                                        to={ROUTES.COLLECTIONS}
                                        className="text-sm sm:text-base py-2 px-1 hover:text-accent-hover transition-colors duration-300 min-h-[44px] flex items-center"
                                    >
                                        Collections
                                    </Link>
                                    <Link
                                        to={ROUTES.SEARCH}
                                        className="text-sm sm:text-base py-2 px-1 hover:text-accent-hover transition-colors duration-300 min-h-[44px] flex items-center"
                                    >
                                        Search Models
                                    </Link>
                                </div>
                            </div>

                            {/* COMMUNITY Section */}
                            <div className="mb-4">
                                <h6 className="text-xs sm:text-sm font-bold text-txt-primary mb-2 sm:mb-3">
                                    COMMUNITY
                                </h6>
                                <div className="flex flex-col gap-1">
                                    <Link
                                        to={ROUTES.EVENTS}
                                        className="text-sm sm:text-base py-2 px-1 hover:text-accent-hover transition-colors duration-300 min-h-[44px] flex items-center"
                                    >
                                        Events
                                    </Link>
                                    <Link
                                        to={FORUM_HOME_PATH}
                                        className="text-sm sm:text-base py-2 px-1 hover:text-accent-hover transition-colors duration-300 min-h-[44px] flex items-center"
                                    >
                                        Forum
                                    </Link>
                                    <Link
                                        to={ROUTES.BLOG}
                                        className="text-sm sm:text-base py-2 px-1 hover:text-accent-hover transition-colors duration-300 min-h-[44px] flex items-center"
                                    >
                                        Blog
                                    </Link>
                                    <Link
                                        to="/forum/rules"
                                        className="text-sm sm:text-base py-2 px-1 hover:text-accent-hover transition-colors duration-300 min-h-[44px] flex items-center"
                                    >
                                        Forum Rules
                                    </Link>
                                </div>
                            </div>

                            {/* MARKETPLACE Section */}
                            <div className="mb-4">
                                <h6 className="text-xs sm:text-sm font-bold text-txt-primary mb-2 sm:mb-3">
                                    MARKETPLACE
                                </h6>
                                <div className="flex flex-col gap-1">
                                    <Link
                                        to="/marketplace"
                                        className="text-sm sm:text-base py-2 px-1 hover:text-accent-hover transition-colors duration-300 min-h-[44px] flex items-center"
                                    >
                                        All Models
                                    </Link>
                                    <Link
                                        to={ROUTES.MARKETPLACE_FEATURED}
                                        className="text-sm sm:text-base py-2 px-1 hover:text-accent-hover transition-colors duration-300 min-h-[44px] flex items-center"
                                    >
                                        Featured
                                    </Link>
                                    <Link
                                        to={ROUTES.MARKETPLACE_NEW_ARRIVALS}
                                        className="text-sm sm:text-base py-2 px-1 hover:text-accent-hover transition-colors duration-300 min-h-[44px] flex items-center"
                                    >
                                        New Arrivals
                                    </Link>
                                    <Link
                                        to={ROUTES.MARKETPLACE_BEST_SELLERS}
                                        className="text-sm sm:text-base py-2 px-1 hover:text-accent-hover transition-colors duration-300 min-h-[44px] flex items-center"
                                    >
                                        Best Sellers
                                    </Link>
                                </div>
                            </div>

                            {/* BUSINESS Section */}
                            <div className="mb-4">
                                <h6 className="text-xs sm:text-sm font-bold text-txt-primary mb-2 sm:mb-3">
                                    BUSINESS
                                </h6>
                                <div className="flex flex-col gap-1">
                                    <Link
                                        to={ROUTES.BUSINESS_BULK_ORDERS}
                                        className="text-sm sm:text-base py-2 px-1 hover:text-accent-hover transition-colors duration-300 min-h-[44px] flex items-center"
                                    >
                                        Bulk Orders
                                    </Link>
                                    <Link
                                        to={ROUTES.BUSINESS_CUSTOM_SOLUTIONS}
                                        className="text-sm sm:text-base py-2 px-1 hover:text-accent-hover transition-colors duration-300 min-h-[44px] flex items-center"
                                    >
                                        Custom Solutions
                                    </Link>
                                    <Link
                                        to={ROUTES.BUSINESS_ENTERPRISE_SUITE}
                                        className="text-sm sm:text-base py-2 px-1 hover:text-accent-hover transition-colors duration-300 min-h-[44px] flex items-center"
                                    >
                                        Enterprise Suite
                                    </Link>
                                    <Link
                                        to={ROUTES.MODEL_UPLOAD}
                                        className="text-sm sm:text-base py-2 px-1 hover:text-accent-hover transition-colors duration-300 min-h-[44px] flex items-center"
                                    >
                                        Upload Models
                                    </Link>
                                </div>
                            </div>

                            {/* NEWSLETTER Section */}
                            <div className="col-span-2 sm:col-span-1 mb-4">
                                <h6 className="text-xs sm:text-sm font-bold text-txt-primary mb-2 sm:mb-3">
                                    NEWSLETTER
                                </h6>
                                <p className="text-xs text-txt-secondary mb-3 text-center sm:text-left">
                                    Subscribe to get the latest model drops, updates, tips
                                    and special offers.
                                </p>
                                <form
                                    onSubmit={handleSubscribe}
                                    className="flex flex-col gap-2"
                                >
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        required
                                        value={email}
                                        onChange={handleEmailChange}
                                        className="px-3 py-2 rounded border border-br-primary focus:outline-none focus:ring-1 focus:ring-accent focus:border-transparent text-xs bg-bg-primary"
                                    />
                                    <button
                                        type="submit"
                                        className="cta-button px-4 py-2 rounded font-bold text-xs"
                                    >
                                        SUBSCRIBE
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Bottom Section */}
                <div className="bg-bg-primary border-t border-br-secondary py-3">
                    <div className="container mx-auto px-4 sm:px-6">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                            {/* Copyright */}
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-primary rounded-full flex items-center justify-center">
                                    <img
                                        src="/assets/images/logo.png"
                                        alt="Site Logo"
                                        className="w-full h-full object-cover logo-accent"
                                    />
                                </div>
                                <span className="text-xs text-txt-secondary text-center sm:text-left">
                                    © 2025 Print Dungeon. All rights reserved.
                                </span>
                            </div>

                            {/* Policy Links */}
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4">
                                <Link
                                    to={ROUTES.TERMS_OF_USE}
                                    className="text-sm sm:text-base text-txt-secondary hover:text-primary transition-colors py-2 px-1 min-h-[44px] flex items-center"
                                >
                                    Terms of use
                                </Link>
                                <Link
                                    to={ROUTES.REFUND_POLICY}
                                    className="text-sm sm:text-base text-txt-secondary hover:text-primary transition-colors py-2 px-1 min-h-[44px] flex items-center"
                                >
                                    Refund policy
                                </Link>
                                <Link
                                    to={ROUTES.PRIVACY_POLICY}
                                    className="text-sm sm:text-base text-txt-secondary hover:text-primary transition-colors py-2 px-1 min-h-[44px] flex items-center"
                                >
                                    Privacy policy
                                </Link>
                                <Link
                                    to={ROUTES.COOKIE_POLICY}
                                    className="text-sm sm:text-base text-txt-secondary hover:text-primary transition-colors py-2 px-1 min-h-[44px] flex items-center"
                                >
                                    Cookie policy
                                </Link>
                                <Link
                                    to="/sitemap"
                                    className="text-sm sm:text-base text-txt-secondary hover:text-primary transition-colors py-2 px-1 min-h-[44px] flex items-center"
                                >
                                    Sitemap
                                </Link>
                            </div>

                            {/* Social Media Icons */}
                            <div className="flex items-center gap-2 sm:gap-3 text-txt-secondary">
                                <Link
                                    to="/"
                                    className="hover:text-primary transition-colors"
                                    aria-label="Twitter"
                                >
                                    <FaTwitter size={14} className="sm:w-4 sm:h-4" />
                                </Link>
                                <Link
                                    to="/"
                                    className="hover:text-primary transition-colors"
                                    aria-label="Instagram"
                                >
                                    <FaInstagram size={14} className="sm:w-4 sm:h-4" />
                                </Link>
                                <Link
                                    to="/"
                                    className="hover:text-primary transition-colors"
                                    aria-label="Facebook"
                                >
                                    <FaFacebook size={14} className="sm:w-4 sm:h-4" />
                                </Link>
                                <Link
                                    to="/"
                                    className="hover:text-primary transition-colors"
                                    aria-label="Discord"
                                >
                                    <FaDiscord size={14} className="sm:w-4 sm:h-4" />
                                </Link>
                                <Link
                                    to="/"
                                    className="hover:text-primary transition-colors"
                                    aria-label="Pinterest"
                                >
                                    <FaPinterest size={14} className="sm:w-4 sm:h-4" />
                                </Link>
                                <Link
                                    to="/"
                                    className="hover:text-primary transition-colors"
                                    aria-label="LinkedIn"
                                >
                                    <FaLinkedin size={14} className="sm:w-4 sm:h-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>

            <AlertModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Subscription Complete!"
                message="Thanks for joining the 3D Print Dungeon! You'll now get the latest model releases, special offers, and updates delivered straight to your inbox."
            />

            <CookieSettingsModal
                isOpen={showCookieSettings}
                onClose={() => setShowCookieSettings(false)}
            />
        </>
    );
};
