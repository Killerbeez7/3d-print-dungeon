import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
//icons
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle, faTwitter, faFacebook } from "@fortawesome/free-brands-svg-icons";
//hooks
import { useAuth } from "@/hooks/useAuth";
import { useModal } from "@/hooks/useModal";

export const AuthModal = () => {
    const { isOpen, payload, close, toggle } = useModal("auth");
    const mode = (payload && payload.mode) === "signup" ? "signup" : "login";

    const {
        handleEmailSignUp,
        handleEmailSignIn,
        handleGoogleSignIn,
        handleFacebookSignIn,
        handleTwitterSignIn,
    } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    //block page scroll while modal is open
    useEffect(() => {
        const block = (e) => {
            const el = document.activeElement;
            const input =
                el &&
                (el.tagName === "INPUT" ||
                    el.tagName === "TEXTAREA" ||
                    el.isContentEditable);
            if (input) return;
            e.preventDefault();
            e.stopPropagation();
            return false;
        };

        if (isOpen) {
            window.addEventListener("wheel", block, { passive: false });
            window.addEventListener("touchmove", block, { passive: false });
            window.addEventListener("keydown", block, { passive: false });
        }
        return () => {
            window.removeEventListener("wheel", block);
            window.removeEventListener("touchmove", block);
            window.removeEventListener("keydown", block);
        };
    }, [isOpen]);

    if (!isOpen) return null;

    //helpers
    const resetAndClose = () => {
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setError(null);
        close();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        if (mode === "signup" && password !== confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        try {
            if (mode === "signup") {
                await handleEmailSignUp(email, password);
            } else {
                await handleEmailSignIn(email, password);
            }
            resetAndClose();
        } catch (err) {
            setError(err.message);
        }
        setLoading(false);
    };

    const oauth = async (fn) => {
        try {
            setError(null);
            setLoading(true);
            await fn();
            resetAndClose();
        } catch (err) {
            setError(err.message);
        }
        setLoading(false);
    };

    return createPortal(
        <div
            className="fixed inset-0 z-[11001]"
            onClick={resetAndClose}
            style={{ pointerEvents: "auto" }}
        >
            <div
                className="fixed inset-0 z-50"
                onClick={resetAndClose}
                style={{ pointerEvents: "auto" }}
            >
                <div className="absolute inset-0 bg-black/60" />

                <div
                    onClick={(e) => e.stopPropagation()}
                    className="
             fixed w-full max-w-md p-6
             bg-bg-surface text-txt-primary
             border border-br-primary rounded-[10px] shadow-lg
             left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                >
                    {/* close button */}
                    <button
                        className="absolute top-3 right-3 text-txt-secondary hover:text-error"
                        onClick={resetAndClose}
                    >
                        <FontAwesomeIcon icon={faXmark} size="lg" />
                    </button>

                    {/* title */}
                    <h2 className="text-center text-txt-primary text-2xl font-bold mb-5">
                        {mode === "signup" ? "Sign Up" : "Sign In"}
                    </h2>

                    {/* form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <label className="block">
                            <span className="mb-1 font-medium">Email</span>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="
                   w-full px-3 py-2 mt-1
                   border-2 border-br-primary rounded-[10px]
                   bg-bgPrimary text-txt-primary
                   focus:outline-none focus:border-focus focus:ring-focus"
                            />
                        </label>

                        <label className="block">
                            <span className="mb-1 font-medium">Password</span>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="
                   w-full px-3 py-2 mt-1
                   border-2 border-br-primary rounded-[10px]
                   bg-bgPrimary text-txt-primary
                   focus:outline-none focus:border-focus focus:ring-focus"
                            />
                        </label>

                        {mode === "signup" && (
                            <label className="block">
                                <span className="mb-1 font-medium">Confirm Password</span>
                                <input
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="
                     w-full px-3 py-2 mt-1
                     border-2 border-br-primary rounded-[10px]
                     bg-bgPrimary text-txt-primary
                     focus:outline-none focus:border-focus focus:ring-focus"
                                />
                            </label>
                        )}

                        <div className="h-6 mb-3">
                            {error && (
                                <p className="text-center text-error font-semibold">
                                    {error}
                                </p>
                            )}
                        </div>

                        <button type="submit" className="w-full py-2 cta-button">
                            {loading
                                ? "Processing..."
                                : mode === "signup"
                                ? "Create Account"
                                : "Sign In"}
                        </button>
                    </form>

                    {mode === "login" && (
                        <>
                            <div className="flex items-center my-4">
                                <hr className="flex-grow border-t border-br-secondary" />
                                <span className="mx-2 text-sm text-txt-secondary font-semibold">
                                    OR
                                </span>
                                <hr className="flex-grow border-t border-br-secondary" />
                            </div>

                            <div className="flex justify-center gap-3">
                                <button
                                    onClick={() => oauth(handleFacebookSignIn)}
                                    className="w-10 h-10 flex items-center justify-center
                              rounded-full border border-br-primary
                              hover:bg-[var(--color-btn-primary-hover)]
                              transition-colors"
                                >
                                    <FontAwesomeIcon icon={faFacebook} />
                                </button>

                                <button
                                    onClick={() => oauth(handleGoogleSignIn)}
                                    className="w-10 h-10 flex items-center justify-center
                              rounded-full border border-br-primary
                              hover:bg-[var(--color-btn-primary-hover)]
                              transition-colors"
                                >
                                    <FontAwesomeIcon icon={faGoogle} />
                                </button>

                                <button
                                    onClick={() => oauth(handleTwitterSignIn)}
                                    className="w-10 h-10 flex items-center justify-center
                              rounded-full border border-br-primary
                              hover:bg-[var(--color-btn-primary-hover)]
                              transition-colors"
                                >
                                    <FontAwesomeIcon icon={faTwitter} />
                                </button>
                            </div>
                        </>
                    )}

                    <p className="text-center text-sm mt-5">
                        {mode === "signup" ? (
                            <>
                                Already have an account?
                                <button
                                    onClick={() => toggle({ mode: "login" })}
                                    className="text-accent hover:underline ml-1 font-medium"
                                >
                                    Sign In
                                </button>
                            </>
                        ) : (
                            <>
                                Don&apos;t have an account?
                                <button
                                    onClick={() => toggle({ mode: "signup" })}
                                    className="text-accent hover:underline ml-1 font-medium"
                                >
                                    Sign Up
                                </button>
                            </>
                        )}
                    </p>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default AuthModal;
