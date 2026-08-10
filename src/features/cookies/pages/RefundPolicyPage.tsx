import { Link } from "react-router-dom";

export const RefundPolicyPage = () => {
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
                        <li className="text-txt-primary">Refund Policy</li>
                    </ol>
                </nav>

                {/* Content */}
                <div className="bg-bg-secondary rounded-lg p-8">
                    <h1 className="text-3xl font-bold text-txt-primary mb-6">
                        Refund Policy
                    </h1>
                    
                    <div className="prose prose-invert max-w-none">
                        <p className="text-txt-secondary mb-4">
                            Last updated: January 2025
                        </p>
                        
                        <h2 className="text-xl font-semibold text-txt-primary mt-8 mb-4">
                            Digital Products
                        </h2>
                        <p className="text-txt-secondary mb-4">
                            Due to the digital nature of our 3D models, we generally do not offer refunds once 
                            a model has been downloaded. However, we may consider refunds in exceptional circumstances.
                        </p>
                        
                        <h2 className="text-xl font-semibold text-txt-primary mt-8 mb-4">
                            Refund Eligibility
                        </h2>
                        <p className="text-txt-secondary mb-4">
                            Refunds may be granted within 7 days of purchase if:
                        </p>
                        <ul className="list-disc list-inside text-txt-secondary mb-4 ml-4">
                            <li>The model file is corrupted or unusable</li>
                            <li>The model description was significantly inaccurate</li>
                            <li>Technical issues prevent download or use</li>
                        </ul>
                        
                        <h2 className="text-xl font-semibold text-txt-primary mt-8 mb-4">
                            How to Request a Refund
                        </h2>
                        <p className="text-txt-secondary mb-4">
                            To request a refund, please contact our support team at 
                            <a href="mailto:support@3dprintdungeon.com" className="text-primary hover:underline">
                                support@3dprintdungeon.com
                            </a>
                            with your order details and reason for the refund request.
                        </p>
                        
                        <h2 className="text-xl font-semibold text-txt-primary mt-8 mb-4">
                            Processing Time
                        </h2>
                        <p className="text-txt-secondary mb-4">
                            Refund requests are typically processed within 3-5 business days. 
                            The refund will be issued to the original payment method.
                        </p>
                        
                        <h2 className="text-xl font-semibold text-txt-primary mt-8 mb-4">
                            Contact Information
                        </h2>
                        <p className="text-txt-secondary mb-4">
                            If you have any questions about our refund policy, please contact us at 
                            <a href="mailto:support@3dprintdungeon.com" className="text-primary hover:underline">
                                support@3dprintdungeon.com
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
} 