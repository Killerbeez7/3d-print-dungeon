import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { paymentService } from "@/services/paymentService";
import PropTypes from "prop-types";

export const SellerVerification = ({ isOpen, onClose }) => {
    const { currentUser } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [step, setStep] = useState("info"); // info, creating, linking, success

    useEffect(() => {
        if (isOpen) {
            setStep("info");
            setError("");
        }
    }, [isOpen]);

    const handleStartVerification = async () => {
        if (!currentUser) {
            setError("Please log in to continue");
            return;
        }

        setIsLoading(true);
        setError("");
        setStep("creating");

        try {
            // Create Stripe Connect account
            const { accountId } = await paymentService.createConnectAccount();
            
            setStep("linking");

            // Create account link for onboarding
            const { url } = await paymentService.createAccountLink(
                accountId,
                `${window.location.origin}/seller/onboarding`,
                `${window.location.origin}/seller/dashboard`
            );

            // Redirect to Stripe onboarding
            window.location.href = url;
            
        } catch (error) {
            console.error("Error setting up seller account:", error);
            setError(error.message || "Failed to set up seller account. Please try again.");
            setStep("info");
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (!isLoading) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-txt-primary">
                        Seller Verification Required
                    </h2>
                    {!isLoading && (
                        <button
                            onClick={handleClose}
                            className="text-txt-secondary hover:text-txt-primary transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Content based on step */}
                {step === "info" && (
                    <div>
                        <div className="mb-6">
                            <div className="flex items-center mb-4">
                                <div className="flex-shrink-0">
                                    <svg className="h-8 w-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-lg font-medium text-txt-primary">
                                        Secure Payment Setup
                                    </h3>
                                </div>
                            </div>
                            
                            <p className="text-txt-secondary mb-4">
                                To sell models on our platform, you need to complete seller verification. 
                                This process helps us ensure secure payments and comply with financial regulations.
                            </p>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-start">
                                    <svg className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-sm text-txt-secondary">Secure payment processing through Stripe</span>
                                </div>
                                <div className="flex items-start">
                                    <svg className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-sm text-txt-secondary">Automatic payouts to your bank account</span>
                                </div>
                                <div className="flex items-start">
                                    <svg className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-sm text-txt-secondary">Tax reporting and compliance support</span>
                                </div>
                                <div className="flex items-start">
                                    <svg className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-sm text-txt-secondary">Keep 95% of your sales (5% platform fee)</span>
                                </div>
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-6">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-yellow-800">
                                            <strong>Important:</strong> You&apos;ll be redirected to Stripe to complete the verification process. 
                                            This is secure and your information is protected.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                                <p className="text-sm text-red-800">{error}</p>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={handleClose}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-txt-secondary hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleStartVerification}
                                disabled={isLoading}
                                className="flex-1 px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isLoading ? "Setting up..." : "Start Verification"}
                            </button>
                        </div>
                    </div>
                )}

                {step === "creating" && (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
                        <h3 className="text-lg font-medium text-txt-primary mb-2">
                            Creating Your Seller Account
                        </h3>
                        <p className="text-txt-secondary">
                            Please wait while we set up your seller account...
                        </p>
                    </div>
                )}

                {step === "linking" && (
                    <div className="text-center py-8">
                        <div className="animate-pulse">
                            <svg className="h-12 w-12 text-accent mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-txt-primary mb-2">
                            Redirecting to Stripe
                        </h3>
                        <p className="text-txt-secondary">
                            You&apos;ll be redirected to complete your verification...
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

SellerVerification.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
}; 