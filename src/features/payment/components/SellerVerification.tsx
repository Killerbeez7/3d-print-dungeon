import { useState, useEffect } from "react";
import FocusLock from "react-focus-lock";
import { ShieldCheck, X } from "lucide-react";

import { Button } from "@/components";
import { Spinner } from "@/features/shared/reusable/Spinner";
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
      const url = await paymentService.createAccountLink(
        accountId,
        finalRefreshUrl,
        finalReturnUrl
      );
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

  const steps = [
    { id: "info", label: "Create your seller account" },
    { id: "linking", label: "Verify your details with Stripe" },
    { id: "success", label: "Come back and publish paid models" },
  ];

  return (
    <div className="fixed inset-0 z-[11000] flex items-end justify-center md:items-center md:p-6">
      <div
        className="absolute inset-0 animate-[fade_0.2s_ease] bg-surface-overlay backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />
      <FocusLock returnFocus className="contents">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="seller-verification-title"
          className="auth-panel relative w-full max-w-lg rounded-t-2xl border border-br-secondary bg-surface-card p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-popover md:rounded-xl md:p-8"
        >
          <div className="flex items-start justify-between gap-4">
            <span className="chamfer flex size-12 items-center justify-center bg-accent-soft text-accent [--cut:9px]">
              <ShieldCheck className="size-6" aria-hidden="true" />
            </span>
            {!isLoading && (
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close"
                className="flex size-9 items-center justify-center rounded-md text-txt-secondary transition-colors hover:bg-muted hover:text-txt-primary"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            )}
          </div>

          <p className="label-mono mt-5 text-accent">Seller verification</p>
          <h2 id="seller-verification-title" className="mt-1 text-2xl font-bold">
            Complete setup to start selling
          </h2>

          {step === "info" && (
            <>
              <p className="mt-2 text-sm leading-relaxed text-txt-secondary">
                To sell paid models, you need to complete a quick Stripe verification.
              </p>

              <ol className="mt-6 space-y-3">
                {steps.map((item, index) => (
                  <li key={item.id} className="flex items-center gap-3 text-sm text-txt-primary">
                    <span className="chamfer flex size-7 items-center justify-center bg-muted font-mono text-xs text-txt-secondary [--cut:5px]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {item.label}
                  </li>
                ))}
              </ol>

              {error && (
                <p role="alert" className="mt-5 rounded-lg border border-error/40 bg-error/10 px-4 py-3 text-sm text-txt-primary">
                  {error}
                </p>
              )}

              <div className="mt-8 grid grid-cols-2 gap-2">
                <Button variant="secondary" onClick={handleClose}>
                  Not now
                </Button>
                <Button onClick={handleStartVerification} isLoading={isLoading}>
                  {isLoading ? "Setting up…" : "Start verification"}
                </Button>
              </div>
            </>
          )}

          {(step === "creating" || step === "linking") && (
            <div className="flex flex-col items-center gap-4 py-10 text-center" role="status">
              <Spinner size={28} />
              <p className="text-sm text-txt-secondary">
                {step === "creating" ? "Creating your seller account…" : "Redirecting to Stripe…"}
              </p>
            </div>
          )}
        </div>
      </FocusLock>
    </div>
  );
};
