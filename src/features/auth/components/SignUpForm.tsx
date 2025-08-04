import { useState, FormEvent, ChangeEvent } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useProgressiveValidation } from "@/features/auth/hooks/useProgressiveValidation";
import {
    handleAuthError,
    formatErrorForDisplay,
} from "@/features/auth/utils/errorHandling";
import { ValidityIndicator } from "./ValidityIndicator";
import { Spinner } from "@/features/shared/reusable/Spinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle, faTwitter, faFacebook } from "@fortawesome/free-brands-svg-icons";
import {
    faEye,
    faEyeSlash,
    faEnvelope,
    faLock,
    faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";

interface SignUpFormProps {
    onSwitchToSignIn: () => void;
}

export const SignUpForm = ({ onSwitchToSignIn }: SignUpFormProps) => {
    const {
        handleEmailSignUp,
        handleGoogleSignIn,
        handleFacebookSignIn,
        handleTwitterSignIn,
    } = useAuth();

    const { fields, handleFieldChange, handleFieldBlur, isFormValid, getFieldError } =
        useProgressiveValidation({
            initialValues: {
                email: "",
                password: "",
                confirmPassword: "",
            },
            mode: "signup",
        });

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        handleFieldChange(name, value);
    };

    const handleInputBlur = async (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        await handleFieldBlur(name, value);
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();

        if (!isFormValid()) {
            return;
        }

        // Check if passwords match
        if (fields.password.value !== fields.confirmPassword.value) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await handleEmailSignUp(fields.email.value, fields.password.value);
        } catch (err) {
            const errorMessage = handleAuthError(err);
            setError(formatErrorForDisplay(errorMessage));
        } finally {
            setLoading(false);
        }
    };

    const handleOAuthSignIn = async (
        provider: "google" | "facebook" | "twitter"
    ): Promise<void> => {
        setLoading(true);
        setError(null);

        try {
            switch (provider) {
                case "google":
                    await handleGoogleSignIn();
                    break;
                case "facebook":
                    await handleFacebookSignIn();
                    break;
                case "twitter":
                    await handleTwitterSignIn();
                    break;
            }
        } catch (err) {
            const errorMessage = handleAuthError(err);
            setError(formatErrorForDisplay(errorMessage));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email field */}
                <div className="relative">
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Email Address
                    </label>
                    <div className="relative">
                        <FontAwesomeIcon
                            icon={faEnvelope}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={fields.email.value}
                            onChange={handleInputChange}
                            onBlur={handleInputBlur}
                            required
                            spellCheck="false"
                            autoComplete="email"
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-600 focus:border-slate-600 dark:focus:ring-slate-400 dark:focus:border-slate-400 transition-all duration-200"
                            placeholder="Enter your email"
                        />
                        <ValidityIndicator
                            state={
                                fields.email.isChecking
                                    ? "loading"
                                    : fields.email.isValid
                                    ? "valid"
                                    : fields.email.hasError
                                    ? "invalid"
                                    : null
                            }
                        />
                    </div>
                    {getFieldError("email") && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                            {getFieldError("email")}
                        </p>
                    )}
                </div>

                {/* Password field */}
                <div className="relative">
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Password
                    </label>
                    <div className="relative">
                        <FontAwesomeIcon
                            icon={faLock}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            value={fields.password.value}
                            onChange={handleInputChange}
                            onBlur={handleInputBlur}
                            required
                            spellCheck="false"
                            autoComplete="new-password"
                            className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-600 focus:border-slate-600 dark:focus:ring-slate-400 dark:focus:border-slate-400 transition-all duration-200"
                            placeholder="Create a password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors duration-200"
                        >
                            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                        </button>
                        <ValidityIndicator
                            state={
                                fields.password.isChecking
                                    ? "loading"
                                    : fields.password.isValid
                                    ? "valid"
                                    : fields.password.hasError
                                    ? "invalid"
                                    : null
                            }
                            position="right-12"
                        />
                    </div>
                    {getFieldError("password") && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                            {getFieldError("password")}
                        </p>
                    )}
                </div>

                {/* Confirm Password field */}
                <div className="relative">
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Confirm Password
                    </label>
                    <div className="relative">
                        <FontAwesomeIcon
                            icon={faLock}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            value={fields.confirmPassword.value}
                            onChange={handleInputChange}
                            onBlur={handleInputBlur}
                            required
                            spellCheck="false"
                            autoComplete="new-password"
                            className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-600 focus:border-slate-600 dark:focus:ring-slate-400 dark:focus:border-slate-400 transition-all duration-200"
                            placeholder="Confirm your password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors duration-200"
                        >
                            <FontAwesomeIcon
                                icon={showConfirmPassword ? faEyeSlash : faEye}
                            />
                        </button>
                        <ValidityIndicator
                            state={
                                fields.confirmPassword.isChecking
                                    ? "loading"
                                    : fields.confirmPassword.isValid
                                    ? "valid"
                                    : fields.confirmPassword.hasError
                                    ? "invalid"
                                    : null
                            }
                            position="right-12"
                        />
                    </div>
                    {getFieldError("confirmPassword") && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                            {getFieldError("confirmPassword")}
                        </p>
                    )}
                </div>

                {/* Error message */}
                {error && (
                    <div className="flex items-center p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                        <FontAwesomeIcon
                            icon={faExclamationTriangle}
                            className="text-red-500 mr-2"
                        />
                        <p className="text-red-700 dark:text-red-400 text-sm font-medium">
                            {error}
                        </p>
                    </div>
                )}

                {/* Submit button */}
                <button
                    type="submit"
                    disabled={!isFormValid() || loading}
                    className="w-full py-3 px-4 bg-slate-700 hover:bg-slate-800 disabled:bg-slate-500 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none focus:outline-none focus:ring-2 focus:ring-slate-600 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                >
                    {loading ? (
                        <div className="flex items-center justify-center">
                            <Spinner size={18} />
                            <span className="ml-2">Processing...</span>
                        </div>
                    ) : (
                        "Create Account"
                    )}
                </button>
            </form>

            {/* Social login */}
            <div className="mt-6">
                <div className="flex items-center mb-4">
                    <hr className="flex-grow border-gray-300 dark:border-gray-600" />
                    <span className="mx-4 text-sm text-gray-500 dark:text-gray-400 font-medium">
                        Or continue with
                    </span>
                    <hr className="flex-grow border-gray-300 dark:border-gray-600" />
                </div>

                <div className="grid grid-cols-3 gap-4 xl:grid-cols-1 lg:gap-3">
                    <button
                        onClick={() => handleOAuthSignIn("google")}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 lg:gap-3 py-2 lg:py-3 px-3 lg:px-4 border border-gray-300 dark:border-gray-600 rounded-lg lg:rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-200 dark:hover:border-red-800 text-red-600 dark:text-red-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Continue with Google"
                    >
                        <FontAwesomeIcon icon={faGoogle} size="lg" />
                        <span className="font-medium hidden xl:inline">Continue with Google</span>
                    </button>

                    <button
                        onClick={() => handleOAuthSignIn("facebook")}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 lg:gap-3 py-2 lg:py-3 px-3 lg:px-4 border border-gray-300 dark:border-gray-600 rounded-lg lg:rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-800 text-blue-600 dark:text-blue-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Continue with Facebook"
                    >
                        <FontAwesomeIcon icon={faFacebook} size="lg" />
                        <span className="font-medium hidden xl:inline">Continue with Facebook</span>
                    </button>

                    <button
                        onClick={() => handleOAuthSignIn("twitter")}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 lg:gap-3 py-2 lg:py-3 px-3 lg:px-4 border border-gray-300 dark:border-gray-600 rounded-lg lg:rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-sky-50 dark:hover:bg-sky-900/20 hover:border-sky-200 dark:hover:border-sky-800 text-sky-600 dark:text-sky-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Continue with Twitter"
                    >
                        <FontAwesomeIcon icon={faTwitter} size="lg" />
                        <span className="font-medium hidden xl:inline">Continue with Twitter</span>
                    </button>
                </div>
            </div>

            {/* Switch to Sign In */}
            <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Already have an account?{" "}
                    <button
                        type="button"
                        onClick={onSwitchToSignIn}
                        className="text-slate-700 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-200 font-semibold transition-colors duration-200"
                    >
                        Sign In
                    </button>
                </p>
            </div>
        </div>
    );
};
