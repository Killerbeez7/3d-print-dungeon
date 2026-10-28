import { useState, useEffect } from "react";
import FocusLock from "react-focus-lock";
import { CircleCheck, CircleX, X } from "lucide-react";

import { Button } from "@/components";
import { useModal } from "@/features/shared/modal/hooks/useModal";
import { CheckoutForm } from "./CheckoutForm";
import { LazyStripeProvider } from "../providers/LazyStripeProvider";
import type { PaymentModalProps } from "@/features/payment/types/payment";
import { paymentService } from "@/features/payment/services/paymentService";

export interface PaymentModalWithSuccessProps extends PaymentModalProps {
  onSuccess?: () => void;
}

export const PaymentModal = ({
  model,
  isOpen,
  onClose,
  onSuccess,
}: PaymentModalWithSuccessProps): React.ReactElement | null => {
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "processing" | "success" | "error"
  >("idle");

  const [clientSecret, setClientSecret] = useState<string>("");

  // Create payment intent when the modal is opened
  useEffect(() => {
    const initPayment = async () => {
      if (!isOpen) return;
      try {
        setPaymentStatus("processing");
        const { clientSecret: secret } = (await paymentService.createPaymentIntent(
          model.id,
          model.price
        )) as {
          clientSecret: string;
        };
        setClientSecret(secret);
        setPaymentStatus("idle");
      } catch (error) {
        console.error("Error initializing payment:", error);
        setPaymentStatus("error");
      }
    };

    initPayment();
  }, [isOpen, model.id, model.price]);

  const { close } = useModal("payment");

  const handlePaymentSuccess = () => {
    setPaymentStatus("success");
    setTimeout(() => {
      onClose();
      close();
      if (onSuccess) onSuccess();
      window.location.reload();
    }, 2000);
  };

  const handlePaymentError = (error: unknown) => {
    setPaymentStatus("error");
    console.error("Payment error:", error);
  };

  const handleCancel = () => {
    setPaymentStatus("idle");
    onClose();
    close();
  };

  if (!isOpen || !model) return null;

  return (
    <div className="fixed inset-0 z-[11000] flex items-end justify-center md:items-center md:p-6">
      <div
        className="absolute inset-0 animate-[fade_0.2s_ease] bg-surface-overlay backdrop-blur-sm"
        onClick={paymentStatus === "processing" ? undefined : handleCancel}
        aria-hidden="true"
      />
      <FocusLock returnFocus className="contents">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="payment-title"
          className="auth-panel relative max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-br-secondary bg-surface-card shadow-popover md:rounded-xl"
        >
          {paymentStatus === "success" ? (
            <div className="px-6 py-12 text-center">
              <span className="chamfer mx-auto flex size-14 items-center justify-center bg-success/15 text-success [--cut:10px]">
                <CircleCheck className="size-7" aria-hidden="true" />
              </span>
              <h2 id="payment-title" className="mt-5 text-2xl font-bold">
                Payment successful
              </h2>
              <p className="mt-2 text-txt-secondary">
                You now have access to <strong className="text-txt-primary">{model.name}</strong>.
              </p>
              <p className="label-mono mt-4 text-txt-muted">Taking you back to the model…</p>
            </div>
          ) : paymentStatus === "error" ? (
            <div className="px-6 py-12 text-center">
              <span className="chamfer mx-auto flex size-14 items-center justify-center bg-error/15 text-error [--cut:10px]">
                <CircleX className="size-7" aria-hidden="true" />
              </span>
              <h2 id="payment-title" className="mt-5 text-2xl font-bold">
                Payment failed
              </h2>
              <p className="mt-2 text-txt-secondary">
                There was an issue processing your payment. Please try again.
              </p>
              <div className="mt-6 flex justify-center gap-2">
                <Button variant="secondary" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button onClick={() => setPaymentStatus("idle")}>Try again</Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-4 border-b border-br-subtle px-6 py-4">
                <div>
                  <p className="label-mono text-accent">Checkout</p>
                  <h2 id="payment-title" className="mt-1 text-xl font-bold">
                    Buy this model
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={handleCancel}
                  aria-label="Close checkout"
                  className="flex size-9 items-center justify-center rounded-md text-txt-secondary transition-colors hover:bg-muted hover:text-txt-primary"
                >
                  <X className="size-5" aria-hidden="true" />
                </button>
              </div>

              {/* Order summary, receipt style */}
              <div className="flex items-center gap-4 border-b border-dashed border-br-secondary px-6 py-4">
                {model.renderPrimaryUrl && (
                  <img
                    src={model.renderPrimaryUrl}
                    alt=""
                    className="chamfer size-16 shrink-0 bg-muted object-cover [--cut:9px]"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-txt-primary">{model.name}</p>
                  {model.uploaderDisplayName && (
                    <p className="truncate text-sm text-txt-secondary">by {model.uploaderDisplayName}</p>
                  )}
                </div>
                <p className="font-mono text-lg font-semibold text-ember">
                  {paymentService.formatPrice(model.price)}
                </p>
              </div>

              <div className="px-6 py-5">
                <LazyStripeProvider clientSecret={clientSecret}>
                  <CheckoutForm
                    modelId={model.id}
                    amount={model.price}
                    modelName={model.name}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                    onCancel={handleCancel}
                  />
                </LazyStripeProvider>
              </div>
            </>
          )}
        </div>
      </FocusLock>
    </div>
  );
};
