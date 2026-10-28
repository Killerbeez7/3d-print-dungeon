import { useState, useCallback, MouseEvent, useEffect } from "react";
import { createPortal } from "react-dom";
import FocusLock from "react-focus-lock";
import { Check, X } from "lucide-react";

import { useModal } from "@/features/shared/modal/hooks/useModal";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { BrandMark } from "@/features/shared/components/BrandMark";
import { SignInForm } from "./SignInForm";
import { SignUpForm } from "./SignUpForm";

type AuthMode = "signin" | "signup";

const perks = [
  "Download models shared by the community",
  "Upload and showcase your own prints",
  "Join the forum and events",
];

export const AuthModal = () => {
  const { isOpen, payload, close } = useModal("auth");
  const { currentUser } = useAuth();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [isSelectingText, setIsSelectingText] = useState(false);

  const handleClose = useCallback(() => {
    if (!isSelectingText) {
      close();
    }
  }, [close, isSelectingText]);

  // Update mode when payload changes or modal opens
  useEffect(() => {
    if (isOpen && payload?.mode) {
      setMode(payload.mode === "signup" ? "signup" : "signin");
    }
  }, [isOpen, payload?.mode]);

  // Close modal when user is authenticated
  useEffect(() => {
    if (currentUser && isOpen) {
      close();
    }
  }, [currentUser, isOpen, close]);

  // Escape closes the dialog
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, close]);

  // Text selection that ends outside the dialog shouldn't close it.
  const handleMouseDown = useCallback(() => {
    setIsSelectingText(true);
  }, []);

  const handleMouseUp = useCallback(() => {
    setTimeout(() => {
      setIsSelectingText(false);
    }, 100);
  }, []);

  if (!isOpen) return null;

  const isSignUp = mode === "signup";

  return createPortal(
    <div className="fixed inset-0 z-[11000]" onClick={handleClose}>
      <div className="absolute inset-0 animate-[fade_0.2s_ease] bg-surface-overlay backdrop-blur-sm" />

      <FocusLock returnFocus>
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-title"
          onClick={(e: MouseEvent<HTMLDivElement>) => e.stopPropagation()}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          className="auth-panel fixed inset-x-0 bottom-0 z-[11001] flex max-h-[92dvh] flex-col overflow-hidden rounded-t-2xl border border-br-secondary bg-surface-card text-txt-primary shadow-2xl md:inset-auto md:left-1/2 md:top-1/2 md:max-h-[90dvh] md:w-full md:max-w-4xl md:-translate-x-1/2 md:-translate-y-1/2 md:flex-row md:rounded-xl"
        >
          {/* Artwork panel (desktop) */}
          <div
            data-theme="dark"
            className="relative hidden w-[42%] shrink-0 flex-col justify-between overflow-hidden bg-page p-8 text-txt-primary md:flex"
          >
            <img
              src="/assets/images/hero-miniatures.webp"
              alt=""
              className="absolute inset-0 size-full object-cover opacity-60"
            />
            <div className="bg-layer-lines absolute inset-0" aria-hidden="true" />
            <div
              className="absolute inset-0 bg-gradient-to-t from-page via-page/70 to-page/20"
              aria-hidden="true"
            />
            <BrandMark className="relative" />
            <div className="relative">
              <p className="font-display text-2xl font-bold leading-tight tracking-tight">
                {isSignUp ? "Join the workshop." : "Back to the forge."}
              </p>
              <ul className="mt-5 space-y-2.5">
                {perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2.5 text-sm text-txt-secondary">
                    <span className="chamfer mt-0.5 flex size-4 shrink-0 items-center justify-center bg-btn-primary [--cut:3px]">
                      <Check className="size-3 text-white" aria-hidden="true" />
                    </span>
                    {perk}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Form panel */}
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex items-center justify-between gap-4 border-b border-br-subtle px-5 py-3 md:px-8 md:pt-6 md:pb-0 md:border-b-0">
              <div role="tablist" aria-label="Account" className="flex gap-1">
                {(["signin", "signup"] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    role="tab"
                    aria-selected={mode === tab}
                    onClick={() => setMode(tab)}
                    className={`relative h-10 px-3 text-sm font-semibold transition-colors after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:origin-left after:bg-accent after:transition-transform after:duration-300 after:ease-forge ${
                      mode === tab
                        ? "text-txt-primary after:scale-x-100"
                        : "text-txt-muted after:scale-x-0 hover:text-txt-primary"
                    }`}
                  >
                    {tab === "signin" ? "Sign in" : "Create account"}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="flex size-10 items-center justify-center rounded-lg text-txt-muted transition-colors hover:bg-muted hover:text-txt-primary"
                onClick={handleClose}
                onMouseDown={(e) => e.stopPropagation()}
                onMouseUp={(e) => e.stopPropagation()}
                aria-label="Close"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8 pt-5 md:px-8 md:pt-6">
              <h2 id="auth-title" className="text-2xl font-bold">
                {isSignUp ? "Create your account" : "Welcome back"}
              </h2>
              <p className="mb-6 mt-1.5 text-sm text-txt-secondary">
                {isSignUp
                  ? "It takes a minute. Then upload, like and follow."
                  : "Sign in to download, upload and join the community."}
              </p>

              {isSignUp ? (
                <SignUpForm onSwitchToSignIn={() => setMode("signin")} />
              ) : (
                <SignInForm onSwitchToSignUp={() => setMode("signup")} />
              )}
            </div>
          </div>
        </div>
      </FocusLock>
    </div>,
    document.body
  );
};
