import PropTypes from 'prop-types';

export function AuthModal({ isOpen, onClose, isSignUp, onSwitchMode }) {
    if (!isOpen) return null; // Hide if the modal is closed

    return (
        <div
            className="
        fixed inset-0 
        flex items-center justify-center
        bg-black/30 backdrop-blur-sm
        z-50
      "
            onClick={onClose} // Close if user clicks outside the card
        >
            <div
                className="
          w-full max-w-md p-6 
          bg-white rounded-md shadow-md 
          relative
        "
                onClick={(e) =>
                    e.stopPropagation()
                } /* Prevent overlay click from closing modal */
            >
                {/* Header */}
                <h2 className="text-2xl font-semibold text-center text-gray-700 mb-4">
                    {isSignUp ? "Sign Up" : "Sign In"}
                </h2>

                <form className="space-y-4">
                    {/* Optional fields if sign up */}
                    {isSignUp && (
                        <>
                            <div>
                                <label
                                    className="block text-gray-600 mb-1"
                                    htmlFor="name"
                                >
                                    Name
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    required
                                    className="
                    w-full px-3 py-2 
                    border border-gray-300 
                    rounded-md focus:outline-none 
                    focus:ring-1 focus:ring-blue-500
                  "
                                    placeholder="John Doe"
                                />
                            </div>
                        </>
                    )}

                    {/* Email Field */}
                    <div>
                        <label
                            className="block text-gray-600 mb-1"
                            htmlFor="email"
                        >
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            required
                            className="
                w-full px-3 py-2 
                border border-gray-300 
                rounded-md 
                focus:outline-none focus:ring-1 focus:ring-blue-500
              "
                            placeholder="you@example.com"
                        />
                    </div>

                    {/* Password Field */}
                    <div>
                        <label
                            className="block text-gray-600 mb-1"
                            htmlFor="password"
                        >
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            required
                            className="
                w-full px-3 py-2 
                border border-gray-300 
                rounded-md 
                focus:outline-none focus:ring-1 focus:ring-blue-500
              "
                            placeholder="Enter your password"
                        />
                    </div>

                    {/* Confirm Password If SignUp */}
                    {isSignUp && (
                        <div>
                            <label
                                className="block text-gray-600 mb-1"
                                htmlFor="confirmPass"
                            >
                                Confirm Password
                            </label>
                            <input
                                id="confirmPass"
                                type="password"
                                required
                                className="
                  w-full px-3 py-2 
                  border border-gray-300 
                  rounded-md 
                  focus:outline-none 
                  focus:ring-1 focus:ring-blue-500
                "
                                placeholder="Re-enter your password"
                            />
                        </div>
                    )}

                    {/* Extra row if sign in */}
                    {!isSignUp && (
                        <div className="flex items-center justify-between">
                            <label className="inline-flex items-center text-gray-600">
                                <input
                                    type="checkbox"
                                    className="form-checkbox h-4 w-4 text-blue-500"
                                />
                                <span className="ml-2">Remember me</span>
                            </label>
                            <a
                                href="#"
                                className="text-sm text-blue-600 hover:underline"
                            >
                                Forgot password?
                            </a>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="
              w-full bg-blue-500 text-white 
              py-2 rounded-md 
              hover:bg-blue-600 
              transition-colors
            "
                    >
                        {isSignUp ? "Sign Up" : "Sign In"}
                    </button>
                </form>

                {/* Switch Mode Link */}
                {isSignUp ? (
                    <p className="text-center text-sm text-gray-600 mt-4">
                        Already have an account?{" "}
                        <button
                            type="button"
                            onClick={onSwitchMode}
                            className="text-blue-600 hover:underline font-medium"
                        >
                            Sign in
                        </button>
                    </p>
                ) : (
                    <p className="text-center text-sm text-gray-600 mt-4">
                        Don&apos;t have an account?{" "}
                        <button
                            type="button"
                            onClick={onSwitchMode}
                            className="text-blue-600 hover:underline font-medium"
                        >
                            Sign up
                        </button>
                    </p>
                )}

                {/* Optional close (X) button */}
                <button
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                    onClick={onClose}
                    aria-label="Close"
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