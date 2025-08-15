import { useState, useEffect } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { paymentService } from "@/features/payment/services/paymentService";
import type { SellerVerificationProps } from "@/features/payment/types/payment";

export const SellerVerification = ({
    isOpen,
    onClose,
    returnUrl,
}: SellerVerificationProps) => {
    const { currentUser } = useAuth();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [step, setStep] = useState<"info" | "creating" | "linking" | "success">("info");

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
            // Check if a Connect account already exists (resume flow)
            let status = await paymentService.checkConnectStatus();
            let accountId = status?.accountId ?? null;

            // If no account yet, create one
            if (!accountId) {
                const created = (await paymentService.createConnectAccount()) as {
                    accountId: string;
                };
                accountId = created?.accountId;
                if (!accountId) {
                    throw new Error("Failed to create or get a Stripe Connect account.");
                }
                // Refresh status snapshot (non-blocking)
                try {
                    status = await paymentService.checkConnectStatus();
                } catch {}
            }

            setStep("linking");
            const finalReturnUrl = returnUrl || `${window.location.origin}/seller/dashboard`;
            const finalRefreshUrl = returnUrl || `${window.location.origin}/seller/onboarding`;
            const url = await paymentService.createAccountLink(accountId, finalRefreshUrl, finalReturnUrl);
            if (!url) {
                throw new Error("createAccountLink did not return a URL.");
            }
            window.location.href = url;
        } catch (error) {
            setError(error instanceof Error ? error.message : String(error));
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
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all duration-300">
            <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl border border-gray-200/50 transform transition-all duration-300 scale-100 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                            <svg
                                className="w-6 h-6 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-700">
                                Seller Verification
                            </h2>
                            <p className="text-sm text-gray-600">
                                Complete setup to start selling
                            </p>
                        </div>
                    </div>
                    {!isLoading && (
                        <button
                            onClick={handleClose}
                            className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-txt-secondary hover:text-txt-primary hover:bg-gray-200 transition-all duration-200"
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    )}
                </div>
                {step === "info" && (
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                            To sell paid models, you need to complete a quick Stripe
                            verification.
                        </p>
                        {error && (
                            <div className="p-2 border border-error/30 rounded text-sm text-error bg-error/5">
                                {error}
                            </div>
                        )}
                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={handleClose}
                                className="px-3 py-2 border border-br-secondary rounded text-sm text-gray-600 hover:bg-bg-tertiary"
                            >
                                Close
                            </button>
                            <button
                                onClick={handleStartVerification}
                                disabled={isLoading}
                                className="px-3 py-2 bg-accent text-white rounded text-sm hover:bg-accent-hover disabled:opacity-50"
                            >
                                {isLoading ? "Setting up..." : "Start verification"}
                            </button>
                        </div>
                    </div>
                )}
                {step === "creating" && (
                    <div className="text-center py-6 space-y-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-accent border-t-transparent mx-auto"></div>
                        <p className="text-sm text-txt-secondary">
                            Creating your seller account…
                        </p>
                    </div>
                )}
                {step === "linking" && (
                    <div className="text-center py-6 space-y-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-accent border-t-transparent mx-auto"></div>
                        <p className="text-sm text-txt-secondary">
                            Redirecting to Stripe…
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
