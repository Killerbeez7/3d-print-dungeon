import { useState, FormEvent, ChangeEvent } from "react";
import { createPortal } from "react-dom";
import FocusLock from "react-focus-lock";
import { resetPassword } from "@/features/auth/services/authService";
import { handleAuthError, formatErrorForDisplay } from "@/features/auth/utils/errorHandling";
import { Spinner } from "@/features/shared/reusable/Spinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faEnvelope, faCheckCircle } from "@fortawesome/free-solid-svg-icons";

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
        <div
            className={`fixed inset-0 z-[12000] transition-opacity duration-200 ${
                isOpen ? "opacity-100" : "opacity-0"
            }`}
            onClick={handleClose}
            style={{ pointerEvents: "auto" }}
        >
            {/* Backdrop with blur effect */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            <FocusLock returnFocus>
                <div
                    onClick={(e) => e.stopPropagation()}
                    className={`
                        fixed z-[12001] w-full max-w-md
                        bg-white text-gray-900
                        border border-gray-200 rounded-none md:rounded-2xl shadow-2xl
                        left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                        transition-all duration-300 ease-out
                        ${isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"}
                    `}
                >
                    {/* Header */}
                    <div className="relative p-6 pb-4">
                        {/* Close button */}
                        <button
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 text-gray-500 hover:text-gray-700"
                            onClick={handleClose}
                            disabled={loading}
                            aria-label="Close modal"
                        >
                            <FontAwesomeIcon icon={faXmark} size="lg" />
                        </button>

                        {/* Title */}
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold mb-2 text-gray-900">
                                {success ? "Check Your Email" : "Reset Password"}
                            </h2>
                            <p className="text-gray-600 text-sm">
                                {success
                                    ? "We've sent you a password reset link"
                                    : "Enter your email to receive a password reset link"}
                            </p>
                        </div>

                        {/* Content */}
                        {success ? (
                            <div className="text-center space-y-4">
                                <div className="flex justify-center">
                                    <FontAwesomeIcon
                                        icon={faCheckCircle}
                                        className="text-green-500 text-4xl"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <p className="text-gray-700">
                                        We&apos;ve sent a password reset link to:
                                    </p>
                                    <p className="font-medium text-gray-900 break-all">{email}</p>
                                    <p className="text-sm text-gray-600">
                                        Click the link in your email to reset your password.
                                    </p>
                                    <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                        <p className="text-sm text-gray-600">
                                            <span className="text-gray-500">💡</span> <strong>Didn&apos;t receive the email?</strong> Check your spam or junk folder.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="w-full py-3 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                >
                                    Got it
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Email field */}
                                <div className="relative">
                                    <div className="relative">
                                        <FontAwesomeIcon
                                            icon={faEnvelope}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                        />
                                        <input
                                            id="reset-email"
                                            name="email"
                                            type="email"
                                            value={email}
                                            onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                                            required
                                            spellCheck="false"
                                            autoComplete="email"
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                            placeholder="Enter your email"
                                            disabled={loading}
                                        />
                                    </div>
                                </div>

                                {/* Error message */}
                                {error && (
                                    <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-xl">
                                        <p className="text-red-700 text-sm font-medium">
                                            {error}
                                        </p>
                                    </div>
                                )}

                                {/* Submit button */}
                                <button
                                    type="submit"
                                    disabled={loading || !email.trim()}
                                    className="w-full py-3 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                >
                                    {loading ? (
                                        <div className="flex items-center justify-center">
                                            <Spinner size={18} />
                                            <span className="ml-2">Sending...</span>
                                        </div>
                                    ) : (
                                        "Send Reset Link"
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </FocusLock>
        </div>,
        document.body
    );
};
