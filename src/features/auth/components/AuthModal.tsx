import { useState, useCallback, MouseEvent, useEffect } from "react";
import { createPortal } from "react-dom";
import FocusLock from "react-focus-lock";
import { useModal } from "@/hooks/useModal";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { SignInForm } from "./SignInForm";
import { SignUpForm } from "./SignUpForm";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

type AuthMode = "signin" | "signup";

export const AuthModal = () => {
    const { isOpen, payload, close } = useModal("auth");
    const { currentUser } = useAuth();
    const [mode, setMode] = useState<AuthMode>("signin");
    const [isSelectingText, setIsSelectingText] = useState(false);

    const handleModeSwitch = useCallback((newMode: AuthMode) => {
        setMode(newMode);
    }, []);

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

    // Handle text selection events
    const handleMouseDown = useCallback(() => {
        setIsSelectingText(true);
    }, []);

    const handleMouseUp = useCallback(() => {
        // Delay resetting to allow for text selection completion
        setTimeout(() => {
            setIsSelectingText(false);
        }, 100);
    }, []);

    if (!isOpen) return null;

    return createPortal(
        <div
            className={`fixed inset-0 z-[11000] transition-opacity duration-200 ${
                isOpen ? "opacity-100" : "opacity-0"
            }`}
            onClick={handleClose}
            style={{ pointerEvents: "auto" }}
        >
            {/* Backdrop with blur effect */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            <FocusLock returnFocus>
                <div
                    onClick={(e: MouseEvent<HTMLDivElement>) => e.stopPropagation()}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    className={`
                        fixed z-[11001] w-full max-w-md
                        bg-white dark:bg-gray-900 text-gray-900 dark:text-white
                        border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl
                        left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                        transition-all duration-300 ease-out
                        ${isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"}
                    `}
                >
                    {/* Header */}
                    <div className="relative p-6 pb-4">
                        {/* Close button */}
                        <button
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            onClick={handleClose}
                            onMouseDown={(e) => e.stopPropagation()}
                            onMouseUp={(e) => e.stopPropagation()}
                            aria-label="Close modal"
                        >
                            <FontAwesomeIcon icon={faXmark} size="lg" />
                        </button>

                        {/* Title */}
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                                {mode === "signup" ? "Create Account" : "Welcome Back"}
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                {mode === "signup"
                                    ? "Join our community of 3D printing enthusiasts"
                                    : "Sign in to access your account"}
                            </p>
                        </div>

                        {/* Form Content */}
                        {mode === "signin" ? (
                            <SignInForm
                                onSwitchToSignUp={() => handleModeSwitch("signup")}
                            />
                        ) : (
                            <SignUpForm
                                onSwitchToSignIn={() => handleModeSwitch("signin")}
                            />
                        )}
                    </div>
                </div>
            </FocusLock>
        </div>,
        document.body
    );
};
