import { Link } from "react-router-dom";

export const TermsOfUsePage = () => {
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
                        <li className="text-txt-primary">Terms of Use</li>
                    </ol>
                </nav>

                {/* Content */}
                <div className="bg-bg-secondary rounded-lg p-8">
                    <h1 className="text-3xl font-bold text-txt-primary mb-6">
                        Terms of Use
                    </h1>
                    
                    <div className="prose prose-invert max-w-none">
                        <p className="text-txt-secondary mb-4">
                            Last updated: January 2025
                        </p>
                        
                        <h2 className="text-xl font-semibold text-txt-primary mt-8 mb-4">
                            Acceptance of Terms
                        </h2>
                        <p className="text-txt-secondary mb-4">
                            By accessing and using 3D Print Dungeon, you accept and agree to be bound by the terms 
                            and provision of this agreement.
                        </p>
                        
                        <h2 className="text-xl font-semibold text-txt-primary mt-8 mb-4">
                            Use License
                        </h2>
                        <p className="text-txt-secondary mb-4">
                            Permission is granted to temporarily download one copy of the materials on 3D Print Dungeon 
                            for personal, non-commercial transitory viewing only.
                        </p>
                        
                        <h2 className="text-xl font-semibold text-txt-primary mt-8 mb-4">
                            User Content
                        </h2>
                        <p className="text-txt-secondary mb-4">
                            Users may upload, submit, or create content. You retain ownership of your content, 
                            but grant us a license to use, display, and distribute it on our platform.
                        </p>
                        
                        <h2 className="text-xl font-semibold text-txt-primary mt-8 mb-4">
                            Prohibited Uses
                        </h2>
                        <p className="text-txt-secondary mb-4">
                            You may not use the service for any unlawful purpose or to solicit others to perform 
                            unlawful acts, or to violate any international, federal, or state regulations.
                        </p>
                        
                        <h2 className="text-xl font-semibold text-txt-primary mt-8 mb-4">
                            Contact Information
                        </h2>
                        <p className="text-txt-secondary mb-4">
                            If you have any questions about these Terms of Use, please contact us at 
                            <a href="mailto:legal@3dprintdungeon.com" className="text-primary hover:underline">
                                legal@3dprintdungeon.com
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
} 