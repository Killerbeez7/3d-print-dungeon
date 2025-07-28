import { Link } from "react-router-dom";

export const PrivacyPolicyPage = () => {
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
                        <li className="text-txt-primary">Privacy Policy</li>
                    </ol>
                </nav>

                {/* Content */}
                <div className="bg-bg-secondary rounded-lg p-8">
                    <h1 className="text-3xl font-bold text-txt-primary mb-6">
                        Privacy Policy
                    </h1>
                    
                    <div className="prose prose-invert max-w-none">
                        <p className="text-txt-secondary mb-4">
                            Last updated: January 2025
                        </p>
                        
                        <h2 className="text-xl font-semibold text-txt-primary mt-8 mb-4">
                            Information We Collect
                        </h2>
                        <p className="text-txt-secondary mb-4">
                            We collect information you provide directly to us, such as when you create an account, 
                            upload models, or contact us for support.
                        </p>
                        
                        <h2 className="text-xl font-semibold text-txt-primary mt-8 mb-4">
                            How We Use Your Information
                        </h2>
                        <p className="text-txt-secondary mb-4">
                            We use the information we collect to provide, maintain, and improve our services, 
                            process transactions, and communicate with you.
                        </p>
                        
                        <h2 className="text-xl font-semibold text-txt-primary mt-8 mb-4">
                            Information Sharing
                        </h2>
                        <p className="text-txt-secondary mb-4">
                            We do not sell, trade, or otherwise transfer your personal information to third parties 
                            without your consent, except as described in this policy.
                        </p>
                        
                        <h2 className="text-xl font-semibold text-txt-primary mt-8 mb-4">
                            Contact Us
                        </h2>
                        <p className="text-txt-secondary mb-4">
                            If you have any questions about this Privacy Policy, please contact us at 
                            <a href="mailto:privacy@3dprintdungeon.com" className="text-primary hover:underline">
                                privacy@3dprintdungeon.com
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
} 