import { useState, FormEvent } from "react";
import { createPortal } from "react-dom";
import FocusLock from "react-focus-lock";
import { Mail, MailCheck, X } from "lucide-react";

import { Button } from "@/components";
import { resetPassword } from "@/features/auth/services/authService";
import {
  handleAuthError,
  formatErrorForDisplay,
} from "@/features/auth/utils/errorHandling";
import { AuthAlert } from "./AuthExtras";

interface PasswordResetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PasswordResetModal = ({ isOpen, onClose }: PasswordResetModalProps) => {
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await resetPassword(email.trim());
      setSuccess(true);
    } catch (err) {
      const errorMessage = handleAuthError(err);
      setError(formatErrorForDisplay(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setEmail("");
      setError(null);
      setSuccess(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[12000]" onClick={handleClose}>
      <div className="absolute inset-0 animate-[fade_0.2s_ease] bg-surface-overlay backdrop-blur-sm" />

      <FocusLock returnFocus>
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-title"
          onClick={(e) => e.stopPropagation()}
          className="auth-panel fixed inset-x-0 bottom-0 z-[12001] rounded-t-2xl border border-br-secondary bg-surface-card p-6 text-txt-primary shadow-2xl md:inset-auto md:left-1/2 md:top-1/2 md:w-full md:max-w-md md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-xl md:p-8"
        >
          <button
            type="button"
            className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-lg text-txt-muted transition-colors hover:bg-muted hover:text-txt-primary"
            onClick={handleClose}
            disabled={loading}
            aria-label="Close"
          >
            <X className="size-5" aria-hidden="true" />
          </button>

          <span className="chamfer flex size-12 items-center justify-center bg-accent-soft text-accent [--cut:9px]">
            {success ? (
              <MailCheck className="size-6" aria-hidden="true" />
            ) : (
              <Mail className="size-6" aria-hidden="true" />
            )}
          </span>

          <h2 id="reset-title" className="mt-5 text-2xl font-bold">
            {success ? "Check your inbox" : "Reset your password"}
          </h2>

          {success ? (
            <div className="mt-2 space-y-4 text-sm text-txt-secondary">
              <p>
                If an account exists for{" "}
                <span className="break-all font-medium text-txt-primary">{email}</span>, a
                reset link is on its way.
              </p>
              <p className="rounded-lg border border-br-subtle bg-muted p-3">
                Nothing after a few minutes? Check your spam folder, or try again.
              </p>
              <Button variant="secondary" size="lg" fullWidth onClick={handleClose}>
                Back to sign in
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-2 space-y-4" noValidate>
              <p className="text-sm text-txt-secondary">
                Enter the email you signed up with and we&apos;ll send you a reset link.
              </p>
              <div>
                <label
                  htmlFor="reset-email"
                  className="mb-1.5 block text-sm font-medium text-txt-secondary"
                >
                  Email
                </label>
                <div className="relative">
                  <Mail
                    className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-txt-muted"
                    aria-hidden="true"
                  />
                  <input
                    id="reset-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="h-12 w-full rounded-lg border border-br-input bg-page pl-10 pr-4 text-sm text-txt-primary transition-[border-color,box-shadow] placeholder:text-txt-muted hover:border-txt-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
                  />
                </div>
              </div>

              {error && <AuthAlert message={error} />}

              <Button
                type="submit"
                size="lg"
                fullWidth
                isLoading={loading}
                disabled={loading || !email.trim()}
              >
                {loading ? "Sending…" : "Send reset link"}
              </Button>
            </form>
          )}
        </div>
      </FocusLock>
    </div>,
    document.body
  );
};
