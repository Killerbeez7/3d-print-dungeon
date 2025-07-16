import { useState, useEffect } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { paymentService } from "@/features/payment/services/paymentService";
import { PaymentModal } from "./PaymentModal";
import type { PurchaseButtonProps } from "@/features/payment/types/payment";
import { useModal } from "@/hooks/useModal";

export const PurchaseButton = ({ model, className = "" }: PurchaseButtonProps) => {
    const { currentUser } = useAuth();
    const [userPurchases, setUserPurchases] = useState<string[]>([]);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const { open: openAuthModal } = useModal("auth");

    useEffect(() => {
        if (currentUser) {
            loadUserPurchases();
        }
    }, [currentUser]);

    const loadUserPurchases = async () => {
        try {
            setIsLoading(true);
            const purchases = await paymentService.getUserPurchases();
            const purchasedModelIds = purchases.map(
                (p: { modelId: string }) => p.modelId
            );
            setUserPurchases(purchasedModelIds);
        } catch (error) {
            console.error("Error loading user purchases:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = async () => {
        if (!currentUser) {
            alert("Please log in to download models");
            return;
        }
        setIsLoading(true);
        try {
            if (model.originalFileUrl) {
                const link = document.createElement("a");
                link.href = model.originalFileUrl;
                link.download = `${model.name}.${model.originalFileUrl.split(".").pop()}`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        } catch (error) {
            console.error("Download error:", error);
            alert("Download failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePurchaseClick = async () => {
        try {
            if (!currentUser) {
                openAuthModal();
                return;
            }
            setIsPaymentModalOpen(true);
        } catch (error) {
            console.error("Error handling purchase click:", error);
        }
    };

    const isOwner = currentUser?.uid === model.uploaderId;
    const hasPurchased = userPurchases.includes(model.id);
    const isFree = !model.isPaid || model.price === 0;

    if (isOwner) {
        return (
            <button
                onClick={handleDownload}
                disabled={isLoading}
                className={`flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
            >
                {isLoading ? (
                    <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Downloading...
                    </div>
                ) : (
                    <>
                        <svg
                            className="w-5 h-5 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                        Download (Owner)
                    </>
                )}
            </button>
        );
    }

    if (hasPurchased) {
        return (
            <button
                onClick={handleDownload}
                disabled={isLoading}
                className={`flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
            >
                {isLoading ? (
                    <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Downloading...
                    </div>
                ) : (
                    <>
                        <svg
                            className="w-5 h-5 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                        Download
                    </>
                )}
            </button>
        );
    }

    if (isFree) {
        return (
            <button
                onClick={handleDownload}
                disabled={isLoading}
                className={`flex items-center justify-center px-6 py-3 bg-accent text-white rounded-md hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
            >
                {isLoading ? (
                    <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Downloading...
                    </div>
                ) : (
                    <>
                        <svg
                            className="w-5 h-5 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                        Free Download
                    </>
                )}
            </button>
        );
    }

    return (
        <>
            <button
                onClick={handlePurchaseClick}
                className={`flex items-center justify-center px-6 py-3 bg-accent text-white rounded-md hover:bg-accent-hover transition-colors ${className}`}
            >
                <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 5M7 13l-1.5-5M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
                    />
                </svg>
                Buy for {paymentService.formatPrice(model.price)}
            </button>

            {isPaymentModalOpen && (
                <PaymentModal
                    model={model}
                    isOpen={isPaymentModalOpen}
                    onClose={() => {
                        setIsPaymentModalOpen(false);
                    }}
                    onSuccess={() => {
                        setIsPaymentModalOpen(false);
                        loadUserPurchases();
                    }}
                />
            )}
        </>
    );
};
