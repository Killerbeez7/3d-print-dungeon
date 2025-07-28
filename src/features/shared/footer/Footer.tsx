import { useState, FormEvent, ChangeEvent } from "react";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";
import { AiOutlineMail } from "react-icons/ai";
import { AlertModal } from "../AlertModal";
import { CookieSettingsModal } from "../../cookies/components/CookieSettingsModal";

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
            <footer className="text-txt-secondary py-10 divider-top z-10 min-h-[28rem]">
                <div className="container mx-auto px-6 sm:px-8">
                    {/* Footer Top Section */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center sm:text-left">
                        {/* Company Info */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-txt-primary">
                                3D Print Dungeon
                            </h3>
                            <p className="text-sm mt-2">
                                Your one-stop shop for all things 3D printing. Innovating your
                                designs with the power of 3D printing technology.
                            </p>
                        </div>

                        {/* Useful Links */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-txt-primary">
                                Useful Links
                            </h3>
                            <div className="flex flex-col gap-2">
                                <a
                                    href="#"
                                    className="block px-4 py-3 rounded hover:text-accent-hover transition-colors duration-300"
                                >
                                    About Us
                                </a>
                                <a
                                    href="#"
                                    className="block px-4 py-3 rounded hover:text-accent-hover transition-colors duration-300"
                                >
                                    Contact
                                </a>
                                <a
                                    href="#"
                                    className="block px-4 py-3 rounded hover:text-accent-hover transition-colors duration-300"
                                >
                                    Privacy Policy
                                </a>
                                <button
                                    onClick={() => setShowCookieSettings(true)}
                                    className="block w-full text-left px-4 py-3 rounded hover:text-accent-hover transition-colors duration-300"
                                >
                                    Cookie Settings
                                </button>
                                <a
                                    href="#"
                                    className="block px-4 py-3 rounded hover:text-accent-hover transition-colors duration-300"
                                >
                                    Terms & Conditions
                                </a>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="mb-6">
                            <h3 className="text font-semibold text-txt-primary">Contact</h3>
                            <ul className="mt-2 text-sm">
                                <li>123 3D Print St., Tech City, TX 75001</li>
                                <li>
                                    Email:{" "}
                                    <a
                                        href="mailto:contact@3dprintdungeon.com"
                                        className="hover:text-accent-hover"
                                    >
                                        contact@3dprintdungeon.com
                                    </a>
                                </li>
                                <li>Phone: +1 (800) 123-4567</li>
                            </ul>
                        </div>

                        {/* Social Media */}
                        <div className="mb-6">
                            <h3 className="font-semibold text-txt-primary">Follow Us</h3>
                            <div className="flex justify-center sm:justify-start space-x-4 text-xl mt-2">
                                <a
                                    href="#"
                                    className="hover:text-accent-hover transition-colors duration-300"
                                    aria-label="Facebook"
                                >
                                    <FaFacebook size={24} />
                                </a>
                                <a
                                    href="#"
                                    className="hover:text-accent-hover transition-colors duration-300"
                                    aria-label="Twitter"
                                >
                                    <FaTwitter size={24} />
                                </a>
                                <a
                                    href="#"
                                    className="hover:text-accent-hover transition-colors duration-300"
                                    aria-label="Instagram"
                                >
                                    <FaInstagram size={24} />
                                </a>
                                <a
                                    href="#"
                                    className="hover:text-accent-hover transition-colors duration-300"
                                    aria-label="LinkedIn"
                                >
                                    <FaLinkedin size={24} />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Newsletter Subscription Section */}
                    <div className="p-6 rounded-lg text-center mt-8 divider-top">
                        <h3 className="font-semibold text-txt-primary">
                            Get the Latest Model Drops
                        </h3>
                        <p className="mt-2">
                            Raid the 3D Print Dungeon: News, Models & Hidden Treasures Await!
                        </p>
                        <form
                            className="mt-4 flex flex-col sm:flex-row justify-center items-center gap-4"
                            onSubmit={handleSubscribe}
                        >
                            <input
                                type="email"
                                placeholder="Enter your email"
                                required
                                value={email}
                                onChange={handleEmailChange}
                                className="px-4 py-2 rounded-[10px] border border-br-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent w-2/3 sm:w-1/2"
                            />
                            <button
                                type="submit"
                                className="px-6 py-2 cta-button w-2/3 sm:w-auto"
                            >
                                <AiOutlineMail className="inline mr-2 text-xl" />
                                Subscribe
                            </button>
                        </form>
                    </div>

                    {/* Footer Bottom Section */}
                    <div className="divider-top mt-8 pt-6 text-center text-sm">
                        <p>&copy; 2025 3D Print Dungeon — All rights reserved</p>
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
