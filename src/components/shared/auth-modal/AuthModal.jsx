import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useAuth } from "@/hooks/useAuth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faGoogle,
    faTwitter,
    faFacebook,
} from "@fortawesome/free-brands-svg-icons";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

export const AuthModal = ({ isOpen, onClose, isSignUp, onSwitchMode }) => {
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

    // Block scrolling behind the modal while keeping scrollbar visible
    useEffect(() => {
        const blockScroll = (e) => {
            // If the user is typing in an input (e.g., arrow keys), allow it
            const activeEl = document.activeElement;
            const isTextInput =
                activeEl &&
                (activeEl.tagName === "INPUT" ||
                    activeEl.tagName === "TEXTAREA" ||
                    activeEl.isContentEditable);

            // If the event is in a text field, let the user use arrow keys, etc.
            if (isTextInput) return;

            e.preventDefault();
            e.stopPropagation();
            return false;
        };

        if (isOpen) {
            // Capture wheel, touchmove, and keydown events at the window level
            window.addEventListener("wheel", blockScroll, { passive: false });
            window.addEventListener("touchmove", blockScroll, {
                passive: false,
            });
            window.addEventListener("keydown", blockScroll, { passive: false });
        } else {
            window.removeEventListener("wheel", blockScroll, {
                passive: false,
            });
            window.removeEventListener("touchmove", blockScroll, {
                passive: false,
            });
            window.removeEventListener("keydown", blockScroll, {
                passive: false,
            });
        }

        return () => {
            window.removeEventListener("wheel", blockScroll, {
                passive: false,
            });
            window.removeEventListener("touchmove", blockScroll, {
                passive: false,
            });
            window.removeEventListener("keydown", blockScroll, {
                passive: false,
            });
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleClose = () => {
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setError(null);
        onClose();
    };

    const handleAuth = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        if (isSignUp && password !== confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        try {
            if (isSignUp) {
                await handleEmailSignUp(email, password);
            } else {
                await handleEmailSignIn(email, password);
            }
            handleClose();
        } catch (err) {
            setError(err.message);
        }
        setLoading(false);
    };

    const handleGoogleLogin = async () => {
        try {
            setError(null);
            setLoading(true);
            await handleGoogleSignIn();
            handleClose();
        } catch (err) {
            setError(err.message);
        }
        setLoading(false);
    };

    const handleFacebookLogin = async () => {
        try {
            setError(null);
            setLoading(true);
            await handleFacebookSignIn();
            handleClose();
        } catch (err) {
            setError(err.message);
        }
        setLoading(false);
    };

    const handleTwitterLogin = async () => {
        try {
            setError(null);
            setLoading(true);
            await handleTwitterSignIn();
            handleClose();
        } catch (err) {
            setError(err.message);
        }
        setLoading(false);
    };

    // This is the full-screen overlay that intercepts clicks and scrolls
    return (
        <div
            className="fixed inset-0 z-50"
            onClick={handleClose}
            style={{ pointerEvents: "auto" }}>
            <div className="absolute inset-0 bg-black/60" />

            {/* The modal itself */}
            <div
                onClick={(e) => e.stopPropagation()} // Prevent closing on modal clicks
                className="fixed w-full max-w-md p-6
                bg-bg-surface text-txt-primary
                border border-br-primary rounded-[10px] shadow-lg
                left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                {/* CLOSE BUTTON */}
                <button
                    className="absolute top-3 right-3 text-txt-secondary hover:text-error"
                    onClick={handleClose}>
                    <FontAwesomeIcon icon={faXmark} size="lg" />
                </button>

                {/* TITLE */}
                <h2 className="text-center text-txt-primary text-2xl font-bold mb-5">
                    {isSignUp ? "Sign Up" : "Sign In"}
                </h2>

                {/* EMAIL / PASSWORD FORM */}
                <form onSubmit={handleAuth} className="space-y-4">
                    <div>
                        <label className="block mb-1 font-medium">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="
                w-full px-3 py-2 
                border-2 border-br-primary rounded-[10px]
                bg-bgPrimary text-txt-primary
                focus:outline-none focus:border-focus focus:ring-focus"
                        />
                    </div>

                    <div>
                        <label className="block mb-1 font-medium">
                            Password
                        </label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            className="
                w-full px-3 py-2 
                border-2 border-br-primary rounded-[10px]
                bg-bgPrimary text-txt-primary
                focus:outline-none focus:border-focus focus:ring-focus"
                        />
                    </div>

                    {/* CONFIRM PASSWORD IF SIGNING UP */}
                    {isSignUp && (
                        <div>
                            <label className="block mb-1 font-medium">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) =>
                                    setConfirmPassword(e.target.value)
                                }
                                placeholder="Re-enter your password"
                                className="
                  w-full px-3 py-2 
                  border-2 border-br-primary rounded-[10px]
                  bg-bgPrimary text-txt-primary
                  focus:outline-none focus:border-focus focus:ring-focus"
                            />
                        </div>
                    )}

                    {/* ERROR MESSAGE */}
                    <div className="h-6 mb-3">
                        {error && (
                            <p className="text-center text-error font-semibold">
                                {error}
                            </p>
                        )}
                    </div>

                    {/* SUBMIT BUTTON */}
                    <button type="submit" className="w-full py-2 cta-button">
                        {loading
                            ? "Processing..."
                            : isSignUp
                            ? "Create Account"
                            : "Sign In"}
                    </button>
                </form>

                {/* SOCIAL LOGIN BUTTONS (only for sign in mode) */}
                {!isSignUp && (
                    <>
                        <div className="flex items-center my-4">
                            <hr className="flex-grow border-t border-br-secondary" />
                            <span className="mx-2 text-sm text-txt-secondary font-semibold">
                                OR
                            </span>
                            <hr className="flex-grow border-t border-br-secondary" />
                        </div>

                        {/* Social icons in a row */}
                        <div className="flex justify-center gap-3">
                            {/* Facebook */}
                            <button
                                onClick={handleFacebookLogin}
                                className="
                  w-10 h-10 flex items-center justify-center
                  rounded-full border border-br-primary
                  hover:bg-[var(--color-btn-primary-hover)]
                  transition-colors
                ">
                                <FontAwesomeIcon icon={faFacebook} />
                            </button>
                            {/* Google */}
                            <button
                                onClick={handleGoogleLogin}
                                className="
                  w-10 h-10 flex items-center justify-center
                  rounded-full border border-br-primary
                  hover:bg-[var(--color-btn-primary-hover)]
                  transition-colors">
                                <FontAwesomeIcon icon={faGoogle} />
                            </button>
                            {/* Twitter */}
                            <button
                                onClick={handleTwitterLogin}
                                className="
                  w-10 h-10 flex items-center justify-center
                  rounded-full border border-br-primary
                  hover:bg-[var(--color-btn-primary-hover)]
                  transition-colors">
                                <FontAwesomeIcon icon={faTwitter} />
                            </button>
                        </div>
                    </>
                )}

                {/* SWITCH MODE (Sign In / Sign Up) */}
                <p className="text-center text-sm mt-5">
                    {isSignUp ? (
                        <>
                            Already have an account?{" "}
                            <button
                                onClick={onSwitchMode}
                                className="text-accent hover:underline ml-1 font-medium">
                                Sign In
                            </button>
                        </>
                    ) : (
                        <>
                            Don&apos;t have an account?{" "}
                            <button
                                onClick={onSwitchMode}
                                className="text-accent hover:underline ml-1 font-medium">
                                Sign Up
                            </button>
                        </>
                    )}
                </p>
            </div>
        </div>
    );
};

AuthModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    isSignUp: PropTypes.bool.isRequired,
    onSwitchMode: PropTypes.func.isRequired,
};
