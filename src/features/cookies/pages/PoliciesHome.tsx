import { Link } from "react-router-dom";
import { ROUTES } from "@/constants/routeConstants";

export const PoliciesHome = () => {
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
                        <li className="text-txt-primary">Policies</li>
                    </ol>
                </nav>

                <div className="bg-bg-secondary rounded-xl shadow-lg p-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-txt-primary mb-4">
                            Legal Policies
                        </h1>
                        <p className="text-txt-secondary">
                            Please review our legal policies to understand how we operate
                            and protect your rights.
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Privacy Policy Card */}
                        <Link
                            to={ROUTES.PRIVACY_POLICY}
                            className="block p-6 bg-bg-secondary rounded-lg hover:bg-bg-primary transition-colors border border-br-secondary hover:border-primary"
                        >
                            <h2 className="text-xl font-semibold text-txt-primary mb-3">
                                Privacy Policy
                            </h2>
                            <p className="text-txt-secondary text-sm">
                                Learn how we collect, use, and protect your personal
                                information.
                            </p>
                        </Link>

                        {/* Terms of Use Card */}
                        <Link
                            to={ROUTES.TERMS_OF_USE}
                            className="block p-6 bg-bg-secondary rounded-lg hover:bg-bg-primary transition-colors border border-br-secondary hover:border-primary"
                        >
                            <h2 className="text-xl font-semibold text-txt-primary mb-3">
                                Terms of Use
                            </h2>
                            <p className="text-txt-secondary text-sm">
                                Understand the terms and conditions for using our
                                platform.
                            </p>
                        </Link>

                        {/* Cookie Policy Card */}
                        <Link
                            to={ROUTES.COOKIE_POLICY}
                            className="block p-6 bg-bg-secondary rounded-lg hover:bg-bg-primary transition-colors border border-br-secondary hover:border-primary"
                        >
                            <h2 className="text-xl font-semibold text-txt-primary mb-3">
                                Cookie Policy
                            </h2>
                            <p className="text-txt-secondary text-sm">
                                Discover how we use cookies to improve your experience.
                            </p>
                        </Link>

                        {/* Refund Policy Card */}
                        <Link
                            to={ROUTES.REFUND_POLICY}
                            className="block p-6 bg-bg-secondary rounded-lg hover:bg-bg-primary transition-colors border border-br-secondary hover:border-primary"
                        >
                            <h2 className="text-xl font-semibold text-txt-primary mb-3">
                                Refund Policy
                            </h2>
                            <p className="text-txt-secondary text-sm">
                                Understand our refund process for digital products.
                            </p>
                        </Link>
                    </div>

                    <div className="mt-8 p-6 bg-bg-secondary rounded-lg">
                        <h3 className="text-lg font-semibold text-txt-primary mb-3">
                            Need Help?
                        </h3>
                        <p className="text-txt-secondary text-sm mb-4">
                            If you have questions about any of our policies, please
                            contact us:
                        </p>
                        <div className="space-y-2 text-sm">
                            <p className="text-txt-secondary">
                                <span className="font-medium text-txt-primary">
                                    Privacy:
                                </span>{" "}
                                <a
                                    href="mailto:privacy@3dprintdungeon.com"
                                    className="text-primary hover:underline"
                                >
                                    privacy@3dprintdungeon.com
                                </a>
                            </p>
                            <p className="text-txt-secondary">
                                <span className="font-medium text-txt-primary">
                                    Legal:
                                </span>{" "}
                                <a
                                    href="mailto:legal@3dprintdungeon.com"
                                    className="text-primary hover:underline"
                                >
                                    legal@3dprintdungeon.com
                                </a>
                            </p>
                            <p className="text-txt-secondary">
                                <span className="font-medium text-txt-primary">
                                    Support:
                                </span>{" "}
                                <a
                                    href="mailto:support@3dprintdungeon.com"
                                    className="text-primary hover:underline"
                                >
                                    support@3dprintdungeon.com
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
