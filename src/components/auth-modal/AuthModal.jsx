import { useState } from "react";
import PropTypes from "prop-types";
import { AuthService } from "../../services/authService";

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

  // Social login handlers (placeholders)
  const handleGoogleLogin = async () => {
    try {
      await AuthService.signInWithGoogle();
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      await AuthService.signInWithFacebook();
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleTwitterLogin = async () => {
    try {
      await AuthService.signInWithTwitter();
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  // ... You can add more for Apple, Epic Games, etc.

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
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-semibold text-center text-txPrimary mb-4">
          {isSignUp ? "Sign Up" : "Sign In"}
        </h2>

        {error && <p className="text-red-500 text-center">{error}</p>}

        {/* Email/Password Form */}
        <form className="space-y-4" onSubmit={handleAuth}>
          <div>
            <label className="block text-txPrimary mb-1">Email</label>
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
            <label className="block text-txPrimary mb-1">Password</label>
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
                onChange={(e) => setConfirmPassword(e.target.value)}
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
            {loading ? "Processing..." : isSignUp ? "Sign Up" : "Sign In"}
          </button>
        </form>

        {/* Separator - 'OR LOG IN WITH' */}
        {!isSignUp && (
          <div className="text-center text-sm text-gray-500 my-4 font-semibold">
            OR LOG IN WITH
          </div>
        )}

        {/* Social Login Buttons (render only if signIn, or also for signUp if you want) */}
        {!isSignUp && (
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
              <i className="fab fa-facebook-f text-blue-600 mr-2"></i>
              Facebook
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
              <i className="fab fa-google text-red-500 mr-2"></i>
              Google
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
              <i className="fab fa-twitter text-blue-400 mr-2"></i>
              Twitter
            </button>

            {/* Example: Apple */}
            <button
              // onClick={handleAppleLogin} - you can define a function for Apple
              className="
                flex items-center border border-gray-300 
                rounded-md px-3 py-2 text-sm 
                hover:bg-gray-100 
                transition-colors
              "
            >
              <i className="fab fa-apple mr-2"></i>
              Apple
            </button>
            {/* Example: Epic Games */}
            <button
              // onClick={handleEpicLogin} - define a function
              className="
                flex items-center border border-gray-300 
                rounded-md px-3 py-2 text-sm 
                hover:bg-gray-100 
                transition-colors
              "
            >
              <i className="fab fa-empire mr-2"></i>
              Epic Games
            </button>
          </div>
        )}

        {/* Switch mode: signIn <-> signUp */}
        <p className="text-center text-sm text-txPrimary mt-4">
          {isSignUp ? "Already have an account?" : "Don’t have an account?"}
          <button
            onClick={onSwitchMode}
            className="text-primary hover:underline font-medium cursor-pointer ml-1"
          >
            {isSignUp ? "Sign in" : "Sign up"}
          </button>
        </p>

        {/* Close (X) button */}
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          onClick={onClose}
        >
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
