import { useState, useEffect } from "react";
import { Download, ShoppingCart } from "lucide-react";
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
    const primaryActionClasses =
        "flex items-center justify-center gap-2 rounded-lg bg-accent px-6 py-3 text-btn-primary-text transition-colors hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-focus focus:ring-offset-2 focus:ring-offset-bg-primary disabled:cursor-not-allowed disabled:opacity-50";
    const successActionClasses =
        "flex items-center justify-center gap-2 rounded-lg bg-success px-6 py-3 text-txt-inverse transition-colors hover:bg-success-hover focus:outline-none focus:ring-2 focus:ring-success focus:ring-offset-2 focus:ring-offset-bg-primary disabled:cursor-not-allowed disabled:opacity-50";

    if (isOwner) {
        return (
            <button
                onClick={handleDownload}
                disabled={isLoading}
                className={`${successActionClasses} ${className}`}
            >
                {isLoading ? (
                    <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        Downloading...
                    </div>
                ) : (
                    <>
                        <Download className="h-5 w-5" aria-hidden="true" />
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
                className={`${successActionClasses} ${className}`}
            >
                {isLoading ? (
                    <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        Downloading...
                    </div>
                ) : (
                    <>
                        <Download className="h-5 w-5" aria-hidden="true" />
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
                className={`${primaryActionClasses} ${className}`}
            >
                {isLoading ? (
                    <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        Downloading...
                    </div>
                ) : (
                    <>
                        <Download className="h-5 w-5" aria-hidden="true" />
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
                className={`${primaryActionClasses} ${className}`}
            >
                <span className="grid grid-cols-[1.25rem_auto_1.25rem] items-center">
                    <span aria-hidden="true" className="w-5 h-5"></span>
                    <span className="inline-flex items-center justify-center gap-2">
                        <ShoppingCart className="h-5 w-5" aria-hidden="true" />
                        <span>Buy model</span>
                    </span>
                    <span aria-hidden="true" className="w-5 h-5"></span>
                </span>
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
