import { useState } from "react";
import PropTypes from "prop-types";
import { useAuth } from "../../contexts/authContext";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faGoogle,
    faTwitter,
    faFacebook,
} from "@fortawesome/free-brands-svg-icons";

export function AuthModal({ isOpen, onClose, isSignUp, onSwitchMode }) {
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
            className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50"
            onClick={onClose}
        >
            <div
                className="
          w-full max-w-md p-6 
          bg-bgPrimary rounded-md shadow-lg shadow-primary 
          relative
        "
                onClick={(e) => e.stopPropagation()} // prevent closing on inner click
            >
                <h2 className="text-2xl font-semibold text-center text-txPrimary mb-4">
                    {isSignUp ? "Sign Up" : "Sign In"}
                </h2>

                {error && <p className="text-red-500 text-center">{error}</p>}

                {/* Email/Password Form */}
                <form className="space-y-4" onSubmit={handleAuth}>
                    <div>
                        <label className="block text-txPrimary mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="
                w-full px-3 py-2 
                border border-gray-300 rounded-md 
                focus:outline-none 
                focus:ring-1 focus:ring-primary
              "
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-txPrimary mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="
                w-full px-3 py-2 
                border border-gray-300 rounded-md 
                focus:outline-none 
                focus:ring-1 focus:ring-primary
              "
                            placeholder="Enter your password"
                        />
                    </div>

                    {isSignUp && (
                        <div>
                            <label className="block text-txPrimary mb-1">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) =>
                                    setConfirmPassword(e.target.value)
                                }
                                className="
                  w-full px-3 py-2 
                  border border-gray-300 rounded-md 
                  focus:outline-none 
                  focus:ring-1 focus:ring-primary
                "
                                placeholder="Re-enter your password"
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        className="
              w-full bg-primary text-white 
              py-2 rounded-md 
              hover:bg-hvPrimary 
              cursor-pointer 
              transition-colors
            "
                    >
                        {loading
                            ? "Processing..."
                            : isSignUp
                            ? "Sign Up"
                            : "Sign In"}
                    </button>
                </form>

                {/* Social Login */}
                {!isSignUp && (
                    <>
                        <div className="text-center text-sm text-gray-500 my-4 font-semibold">
                            OR LOG IN WITH
                        </div>
                        <div className="flex flex-wrap justify-center gap-2">
                            {/* Facebook */}
                            <button
                                onClick={handleFacebookLogin}
                                className="
                  flex items-center border border-gray-300 
                  rounded-md px-3 py-2 text-sm 
                  hover:bg-gray-100 
                  transition-colors
                "
                            >
                                <FontAwesomeIcon icon={faFacebook} />
                            </button>

                            {/* Google */}
                            <button
                                onClick={handleGoogleLogin}
                                className="
                  flex items-center border border-gray-300 
                  rounded-md px-3 py-2 text-sm 
                  hover:bg-gray-100 
                  transition-colors
                "
                            >
                              <FontAwesomeIcon icon={faGoogle} />
                            </button>

                            {/* Twitter */}
                            <button
                                onClick={handleTwitterLogin}
                                className="
                  flex items-center border border-gray-300 
                  rounded-md px-3 py-2 text-sm 
                  hover:bg-gray-100 
                  transition-colors
                "
                            >
                                <FontAwesomeIcon icon={faTwitter} />
                            </button>
                        </div>
                    </>
                )}

                {/* Sign Up / Sign In */}
                <p className="text-center text-sm text-txPrimary mt-4">
                    {isSignUp
                        ? "Already have an account?"
                        : "Don’t have an account?"}
                    <button
                        onClick={onSwitchMode}
                        className="text-primary hover:underline font-medium cursor-pointer ml-1"
                    >
                        {isSignUp ? "Sign in" : "Sign up"}
                    </button>
                </p>

                {/* Close (X) button */}
                <button
                    className="absolute top-3 right-3 text-red-400 hover:text-red-600"
                    onClick={onClose}
                >
                    <FontAwesomeIcon icon="fa-solid fa-xmark" />
                </button>
            </div>
        </div>
    );
}

AuthModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    isSignUp: PropTypes.bool.isRequired,
    onSwitchMode: PropTypes.func.isRequired,
};
