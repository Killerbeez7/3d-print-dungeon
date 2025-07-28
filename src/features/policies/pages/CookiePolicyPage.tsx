import { Link } from "react-router-dom";
import { ROUTES } from "@/constants/routeConstants";
import { FaShieldAlt, FaCog, FaChartBar, FaAd, FaCreditCard, FaEye, FaTrash, FaBan } from "react-icons/fa";

export function CookiePolicyPage() {
    return (
        <main className="min-h-screen bg-bg-primary">
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Breadcrumb Navigation */}
                <nav className="mb-6">
                    <ol className="flex items-center space-x-2 text-sm text-txt-secondary">
                        <li>
                            <Link
                                to="/"
                                className="hover:text-txt-primary transition-colors"
                            >
                                Home
                            </Link>
                        </li>
                        <li>/</li>
                        <li>
                            <Link
                                to="/policies"
                                className="hover:text-txt-primary transition-colors"
                            >
                                Policies
                            </Link>
                        </li>
                        <li>/</li>
                        <li className="text-txt-primary">Cookie Policy</li>
                    </ol>
                </nav>

                <div className="bg-bg-secondary rounded-xl shadow-lg overflow-hidden">
                    {/* Header Section */}
                    <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-8 border-b border-br-secondary">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-primary/10 rounded-lg">
                                <FaShieldAlt className="text-primary text-2xl" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-txt-primary">
                                    Cookie Policy
                                </h1>
                                <p className="text-txt-secondary">
                                    Last updated: {new Date().toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        <p className="text-txt-secondary text-lg">
                            This Cookie Policy explains how 3D Print Dungeon (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) uses cookies and similar technologies when you visit our website.
                        </p>
                    </div>

                    <div className="p-8 space-y-8">
                        {/* What are Cookies */}
                        <section className="bg-bg-secondary rounded-lg p-6">
                            <h2 className="text-2xl font-semibold text-txt-primary mb-4 flex items-center gap-3">
                                <FaCog className="text-primary" />
                                What are Cookies?
                            </h2>
                            <p className="text-txt-secondary mb-4">
                                Cookies are small text files that are stored on your device (computer, tablet, or mobile) when you visit a website. They help us provide you with a better experience by:
                            </p>
                            <div className="grid gap-3 md:grid-cols-2">
                                <div className="flex items-start gap-3 p-3 bg-bg-primary rounded-lg">
                                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                                    <span className="text-txt-secondary">Remembering your preferences and settings</span>
                                </div>
                                <div className="flex items-start gap-3 p-3 bg-bg-primary rounded-lg">
                                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                                    <span className="text-txt-secondary">Analyzing how you use our website</span>
                                </div>
                                <div className="flex items-start gap-3 p-3 bg-bg-primary rounded-lg">
                                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                                    <span className="text-txt-secondary">Providing personalized content and advertisements</span>
                                </div>
                                <div className="flex items-start gap-3 p-3 bg-bg-primary rounded-lg">
                                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                                    <span className="text-txt-secondary">Ensuring secure payment processing</span>
                                </div>
                                <div className="flex items-start gap-3 p-3 bg-bg-primary rounded-lg md:col-span-2">
                                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                                    <span className="text-txt-secondary">Improving website performance and functionality</span>
                                </div>
                            </div>
                        </section>

                        {/* Types of Cookies We Use */}
                        <section>
                            <h2 className="text-2xl font-semibold text-txt-primary mb-6">
                                Types of Cookies We Use
                            </h2>
                            
                            <div className="grid gap-6 md:grid-cols-2">
                                {/* Essential Cookies */}
                                <div className="border border-br-secondary rounded-lg p-6 hover:border-primary/50 transition-colors">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-green-500/10 rounded-lg">
                                            <FaShieldAlt className="text-green-500 text-lg" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-txt-primary">
                                            Essential Cookies
                                        </h3>
                                    </div>
                                    <p className="text-txt-secondary mb-4">
                                        These cookies are necessary for the website to function properly and cannot be disabled. They enable basic functions like page navigation, access to secure areas, and shopping cart functionality.
                                    </p>
                                    <div className="bg-bg-primary p-4 rounded-lg">
                                        <h4 className="font-medium text-txt-primary mb-3">Examples:</h4>
                                        <div className="space-y-2 text-sm text-txt-secondary">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                                <span>Session cookies for login status</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                                <span>CSRF protection tokens</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                                <span>Shopping cart items</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                                <span>Language preference settings</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Analytics Cookies */}
                                <div className="border border-br-secondary rounded-lg p-6 hover:border-primary/50 transition-colors">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-blue-500/10 rounded-lg">
                                            <FaChartBar className="text-blue-500 text-lg" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-txt-primary">
                                            Analytics Cookies
                                        </h3>
                                    </div>
                                    <p className="text-txt-secondary mb-4">
                                        These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. This helps us improve our website and user experience.
                                    </p>
                                    <div className="bg-bg-primary p-4 rounded-lg">
                                        <h4 className="font-medium text-txt-primary mb-3">Examples:</h4>
                                        <div className="space-y-2 text-sm text-txt-secondary">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                                <span>Google Analytics</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                                <span>Page view tracking</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                                <span>User behavior analysis</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                                <span>Performance monitoring</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Marketing Cookies */}
                                <div className="border border-br-secondary rounded-lg p-6 hover:border-primary/50 transition-colors">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-purple-500/10 rounded-lg">
                                            <FaAd className="text-purple-500 text-lg" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-txt-primary">
                                            Marketing Cookies
                                        </h3>
                                    </div>
                                    <p className="text-txt-secondary mb-4">
                                        These cookies are used to track visitors across websites to display relevant and engaging advertisements. They help us provide you with personalized content and offers.
                                    </p>
                                    <div className="bg-bg-primary p-4 rounded-lg">
                                        <h4 className="font-medium text-txt-primary mb-3">Examples:</h4>
                                        <div className="space-y-2 text-sm text-txt-secondary">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                                                <span>Facebook Pixel</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                                                <span>Google Ads</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                                                <span>Social media sharing buttons</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                                                <span>Retargeting campaigns</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Cookies */}
                                <div className="border border-br-secondary rounded-lg p-6 hover:border-primary/50 transition-colors">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-orange-500/10 rounded-lg">
                                            <FaCreditCard className="text-orange-500 text-lg" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-txt-primary">
                                            Payment Cookies
                                        </h3>
                                    </div>
                                    <p className="text-txt-secondary mb-4">
                                        These cookies are necessary for secure payment processing and transaction management. They ensure your payment information is handled securely.
                                    </p>
                                    <div className="bg-bg-primary p-4 rounded-lg">
                                        <h4 className="font-medium text-txt-primary mb-3">Examples:</h4>
                                        <div className="space-y-2 text-sm text-txt-secondary">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                                                <span>Stripe payment tokens</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                                                <span>PayPal session cookies</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                                                <span>3D Secure authentication</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                                                <span>Fraud prevention</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* How to Manage Cookies */}
                        <section className="bg-bg-secondary rounded-lg p-6">
                            <h2 className="text-2xl font-semibold text-txt-primary mb-6 flex items-center gap-3">
                                <FaCog className="text-primary" />
                                How to Manage Cookies
                            </h2>
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="bg-bg-primary p-6 rounded-lg">
                                    <h3 className="text-lg font-semibold text-txt-primary mb-3">
                                        Browser Settings
                                    </h3>
                                    <p className="text-txt-secondary mb-4">
                                        You can control and manage cookies through your browser settings. However, disabling certain cookies may impact your experience on our website.
                                    </p>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex items-center gap-3 p-3 bg-bg-secondary rounded-lg">
                                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                                            <div>
                                                <span className="font-medium text-txt-primary">Chrome:</span>
                                                <p className="text-txt-secondary">Settings → Privacy and security → Cookies and other site data</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-bg-secondary rounded-lg">
                                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                                            <div>
                                                <span className="font-medium text-txt-primary">Firefox:</span>
                                                <p className="text-txt-secondary">Options → Privacy & Security → Cookies and Site Data</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-bg-secondary rounded-lg">
                                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                                            <div>
                                                <span className="font-medium text-txt-primary">Safari:</span>
                                                <p className="text-txt-secondary">Preferences → Privacy → Manage Website Data</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-bg-secondary rounded-lg">
                                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                                            <div>
                                                <span className="font-medium text-txt-primary">Edge:</span>
                                                <p className="text-txt-secondary">Settings → Cookies and site permissions → Cookies and site data</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-bg-primary p-6 rounded-lg">
                                    <h3 className="text-lg font-semibold text-txt-primary mb-3">
                                        Our Cookie Settings
                                    </h3>
                                    <p className="text-txt-secondary mb-4">
                                        You can manage your cookie preferences directly on our website through our cookie settings panel.
                                    </p>
                                    <Link
                                        to="/"
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                                    >
                                        <FaCog />
                                        Manage Cookie Settings
                                    </Link>
                                </div>
                            </div>
                        </section>

                        {/* Your Rights */}
                        <section className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-6">
                            <h2 className="text-2xl font-semibold text-txt-primary mb-6 flex items-center gap-3">
                                <FaEye className="text-primary" />
                                Your Rights
                            </h2>
                            <p className="text-txt-secondary mb-4">
                                Under data protection laws, you have certain rights regarding your personal data and cookie usage:
                            </p>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="flex items-start gap-3 p-4 bg-bg-primary rounded-lg">
                                    <FaEye className="text-primary mt-1 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-medium text-txt-primary mb-1">Right to Information</h4>
                                        <p className="text-sm text-txt-secondary">You have the right to be informed about how we use cookies</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-4 bg-bg-primary rounded-lg">
                                    <FaCog className="text-primary mt-1 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-medium text-txt-primary mb-1">Right to Consent</h4>
                                        <p className="text-sm text-txt-secondary">You can give or withdraw consent for non-essential cookies</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-4 bg-bg-primary rounded-lg">
                                    <FaEye className="text-primary mt-1 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-medium text-txt-primary mb-1">Right to Access</h4>
                                        <p className="text-sm text-txt-secondary">You can request information about what data we collect</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-4 bg-bg-primary rounded-lg">
                                    <FaTrash className="text-primary mt-1 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-medium text-txt-primary mb-1">Right to Deletion</h4>
                                        <p className="text-sm text-txt-secondary">You can request deletion of your personal data</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-4 bg-bg-primary rounded-lg md:col-span-2">
                                    <FaBan className="text-primary mt-1 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-medium text-txt-primary mb-1">Right to Object</h4>
                                        <p className="text-sm text-txt-secondary">You can object to certain types of cookie processing</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Contact Information */}
                        <section className="bg-bg-secondary rounded-lg p-6">
                            <h2 className="text-2xl font-semibold text-txt-primary mb-4">
                                Contact Us
                            </h2>
                            <p className="text-txt-secondary mb-4">
                                If you have any questions about our Cookie Policy or how we use cookies, please contact us:
                            </p>
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="text-center p-4 bg-bg-primary rounded-lg">
                                    <h4 className="font-medium text-txt-primary mb-2">Email</h4>
                                    <a href="mailto:privacy@3dprintdungeon.com" className="text-primary hover:underline">
                                        privacy@3dprintdungeon.com
                                    </a>
                                </div>
                                <div className="text-center p-4 bg-bg-primary rounded-lg">
                                    <h4 className="font-medium text-txt-primary mb-2">Phone</h4>
                                    <span className="text-txt-secondary">+1 (800) 123-4567</span>
                                </div>
                                <div className="text-center p-4 bg-bg-primary rounded-lg">
                                    <h4 className="font-medium text-txt-primary mb-2">Address</h4>
                                    <span className="text-txt-secondary text-sm">123 3D Print St., Tech City, TX 75001</span>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Footer Links */}
                    <div className="bg-bg-primary p-6 border-t border-br-secondary">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="text-sm text-txt-secondary">
                                <p>This Cookie Policy is part of our broader Privacy Policy.</p>
                            </div>
                            <div className="flex gap-4">
                                <Link
                                    to={ROUTES.PRIVACY_POLICY}
                                    className="text-primary hover:text-primary/80 transition-colors"
                                >
                                    Privacy Policy
                                </Link>
                                <Link
                                    to={ROUTES.TERMS_OF_USE}
                                    className="text-primary hover:text-primary/80 transition-colors"
                                >
                                    Terms of Service
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
} 