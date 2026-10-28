import { useState, useEffect } from "react";
import { Download, ShoppingCart } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { paymentService } from "@/features/payment/services/paymentService";
import { PaymentModal } from "./PaymentModal";
import type { PurchaseButtonProps } from "@/features/payment/types/payment";
import { useModal } from "@/features/shared/modal/hooks/useModal";
import { Button } from "@/components";

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
      const purchasedModelIds = purchases.map((p: { modelId: string }) => p.modelId);
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
  const downloadIcon = <Download className="size-5" aria-hidden="true" />;

  if (isOwner || hasPurchased || isFree) {
    const label = isOwner ? "Download your file" : isFree && !hasPurchased ? "Download free" : "Download";

    return (
      <Button
        onClick={handleDownload}
        isLoading={isLoading}
        variant={isOwner ? "secondary" : "primary"}
        size="lg"
        leftIcon={downloadIcon}
        className={className}
      >
        {isLoading ? "Preparing…" : label}
      </Button>
    );
  }

  const formattedPrice = new Intl.NumberFormat("en", {
    style: "currency",
    currency: (model.currency ?? "usd").toUpperCase(),
  }).format(model.price);

  return (
    <>
      <Button
        onClick={handlePurchaseClick}
        variant="ember"
        size="lg"
        leftIcon={<ShoppingCart className="size-5" aria-hidden="true" />}
        className={className}
      >
        Buy for {formattedPrice}
      </Button>

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
