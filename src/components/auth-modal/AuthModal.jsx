import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useAuth } from "../../contexts/authContext";

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

    // disable scrolling
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [isOpen]);

    if (!isOpen) return null;

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
            onClose();
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
            onClose();
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
            onClose();
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
            onClose();
        } catch (err) {
            setError(err.message);
        }
        setLoading(false);
    };

    return (
        <div
            className="fixed inset-0 flex items-center justify-center z-50 
                   bg-black/60"
            onClick={onClose}
        >
            {/* MODAL CONTAINER */}
            <div
                onClick={(e) => e.stopPropagation()} // stop clicks from closing modal
                className="
                relative w-full max-w-md p-6
                bg-white text-txt-primary  // using a solid white background
                border border-br-primary
                rounded-md shadow-lg
                "
            >
                {/* CLOSE BUTTON */}
                <button
                    className="absolute top-3 right-3 text-txt-secondary hover:text-error"
                    onClick={onClose}
                >
                    <FontAwesomeIcon icon={faXmark} size="lg" />
                </button>

                {/* TITLE */}
                <h2 className="text-center text-accent text-2xl font-bold mb-5">
                    {isSignUp ? "Sign Up" : "Sign In"}
                </h2>

                {/* ERROR MESSAGE */}
                {error && (
                    <p className="text-center text-error font-semibold mb-3">
                        {error}
                    </p>
                )}

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
                border border-br-primary rounded
                bg-bgPrimary text-txt-primary
                focus:outline-none focus:ring-2 focus:ring-accent
              "
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
                border border-br-primary rounded
                bg-bgPrimary text-txt-primary
                focus:outline-none focus:ring-2 focus:ring-accent
              "
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
                  border border-br-primary rounded
                  bg-bgPrimary text-txt-primary
                  focus:outline-none focus:ring-2 focus:ring-accent
                "
                            />
                        </div>
                    )}

                    {/* SUBMIT BUTTON */}
                    <button
                        type="submit"
                        className="
              w-full py-2
              rounded bg-accent text-white
              font-semibold
              hover:bg-accent-hover
              transition-colors
              focus:outline-none focus:ring-2 focus:ring-accent
            "
                    >
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
                  hover:bg-bgSecondary
                  transition-colors
                "
                            >
                                <FontAwesomeIcon icon={faFacebook} />
                            </button>
                            {/* Google */}
                            <button
                                onClick={handleGoogleLogin}
                                className="
                  w-10 h-10 flex items-center justify-center
                  rounded-full border border-br-primary
                  hover:bg-bgSecondary
                  transition-colors
                "
                            >
                                <FontAwesomeIcon icon={faGoogle} />
                            </button>
                            {/* Twitter */}
                            <button
                                onClick={handleTwitterLogin}
                                className="
                  w-10 h-10 flex items-center justify-center
                  rounded-full border border-br-primary
                  hover:bg-bgSecondary
                  transition-colors
                "
                            >
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
                                className="text-accent hover:underline ml-1 font-medium"
                            >
                                Sign In
                            </button>
                        </>
                    ) : (
                        <>
                            Don’t have an account?{" "}
                            <button
                                onClick={onSwitchMode}
                                className="text-accent hover:underline ml-1 font-medium"
                            >
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
