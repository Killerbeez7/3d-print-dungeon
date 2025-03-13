import { useState } from "react";
import PropTypes from "prop-types";
import { AuthService } from "../../../services/auth";

export function AuthModal({ isOpen, onClose, isSignUp, onSwitchMode }) {
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
                await AuthService.signUp(email, password);
            } else {
                await AuthService.signIn(email, password);
            }
            onClose();
        } catch (err) {
            setError(err.message);
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50" onClick={onClose}>
            <div className="w-full max-w-md p-6 bg-bg-primary rounded-2xl border border-br-primary shadow-lg shadow-primary relative" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-2xl font-semibold text-center text-txt-primary mb-4">{isSignUp ? "Sign Up" : "Sign In"}</h2>

                {error && <p className="text-error text-center">{error}</p>}

                <form className="space-y-4" onSubmit={handleAuth}>
                    <div>
                        <label className="block text-txt-secondary mb-1">Email</label>
                        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 border border-br-primary rounded-lg text-txt-primary placeholder:text-txt-muted focus:outline-none focus:border-focus focus:ring-focus" placeholder="you@example.com" />
                    </div>

                    <div>
                        <label className="block text-txt-secondary mb-1">Password</label>
                        <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-br-primary rounded-lg text-txt-primary placeholder:text-txt-muted focus:outline-none focus:border-focus focus:ring-focus" placeholder="Enter your password" />
                    </div>

                    {isSignUp && (
                        <div>
                            <label className="block text-txt-secondary mb-1">Confirm Password</label>
                            <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-3 py-2 border border-br-primary rounded-lg text-txt-primary placeholder:text-txt-muted focus:outline-none focus:border-focus focus:ring-focus" placeholder="Re-enter your password" />
                        </div>
                    )}

                    <button type="submit" className="w-full bg-btn-primary text-white py-2 text-lg rounded-lg hover:bg-btn-primary-hover cursor-pointer transition-colors">
                        {loading ? "Processing..." : isSignUp ? "Sign Up" : "Sign In"}
                    </button>
                </form>

                <p className="text-center text-sm text-txt-secondary mt-4">
                    {isSignUp ? "Already have an account?" : "Don’t have an account?"}
                    <button onClick={onSwitchMode} className="text-txt-link hover:underline font-medium cursor-pointer ml-1">
                        {isSignUp ? "Sign in" : "Sign up"}
                    </button>
                </p>

                <button className="absolute top-3 right-3 text-txt-primary hover:text-gray-600" onClick={onClose}>
                    <i className="fas fa-times"></i>
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
