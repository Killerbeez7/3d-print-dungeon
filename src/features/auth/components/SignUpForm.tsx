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

    const handleClearField = (fieldName: string) => {
        handleFieldChange(fieldName, "");
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
                    <div className="relative">
                        <FontAwesomeIcon
                            icon={faEnvelope}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-muted"
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
                            className="w-full pl-10 pr-4 py-3 border border-br-secondary rounded-xl bg-white placeholder-gray-500 shadow-token-inner focus:outline-none focus:ring-2 focus:ring-[var(--color-focus)] focus:border-[var(--color-focus)] transition-all duration-200"
                            placeholder="Enter your email"
                        />
                        <ValidityIndicator
                            state={
                                fields.email.isChecking
                                    ? "loading"
                                    : fields.email.isValid
                                    ? "valid"
                                    : fields.email.hasError
                                    ? "error"
                                    : null
                            }
                            onClear={() => handleClearField("email")}
                            showClearButton={fields.email.hasError}
                        />
                    </div>
                    {getFieldError("email") && (
                        <p className="mt-1 text-sm text-auth-modal-error">
                            {getFieldError("email")}
                        </p>
                    )}
                </div>

                {/* Password field */}
                <div className="relative">
                    <div className="relative">
                        <FontAwesomeIcon
                            icon={faLock}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-muted"
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
                            className="w-full pl-10 pr-12 py-3 border border-br-secondary rounded-xl bg-white placeholder-gray-500 shadow-token-inner focus:outline-none focus:ring-2 focus:ring-[var(--color-focus)] focus:border-[var(--color-focus)] transition-all duration-200"
                            placeholder="Create a password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-txt-muted hover:text-txt-primary transition-colors duration-200"
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
                                    ? "error"
                                    : null
                            }
                            position="right-12"
                            onClear={() => handleClearField("password")}
                            showClearButton={fields.password.hasError}
                        />
                    </div>
                    {getFieldError("password") && (
                        <p className="mt-1 text-sm text-auth-modal-error">
                            {getFieldError("password")}
                        </p>
                    )}
                </div>

                {/* Confirm Password field */}
                <div className="relative">
                    <div className="relative">
                        <FontAwesomeIcon
                            icon={faLock}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-muted"
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
                            className="w-full pl-10 pr-12 py-3 border border-br-secondary rounded-xl bg-white placeholder-gray-500 shadow-token-inner focus:outline-none focus:ring-2 focus:ring-[var(--color-focus)] focus:border-[var(--color-focus)] transition-all duration-200"
                            placeholder="Confirm your password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-txt-muted hover:text-txt-primary transition-colors duration-200"
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
                                    ? "error"
                                    : null
                            }
                            position="right-12"
                            onClear={() => handleClearField("confirmPassword")}
                            showClearButton={fields.confirmPassword.hasError}
                        />
                    </div>
                    {getFieldError("confirmPassword") && (
                        <p className="mt-1 text-sm text-auth-modal-error">
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
                        <p className="text-auth-modal-text-primary text-sm font-medium">
                            {error}
                        </p>
                    </div>
                )}

                {/* Submit button */}
                <button
                    type="submit"
                    disabled={!isFormValid() || loading}
                    className="btn-action-primary w-full py-3 px-4 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-[var(--color-focus)] focus:ring-offset-2"
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
                    <hr className="flex-grow border-br-secondary" />
                    <span className="mx-4 text-sm font-medium">Or continue with</span>
                    <hr className="flex-grow border-br-secondary" />
                </div>

                <div className="grid grid-cols-3 gap-4 xl:grid-cols-1 lg:gap-3">
                    <button
                        onClick={() => handleOAuthSignIn("google")}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 lg:gap-3 py-2 lg:py-3 px-3 lg:px-4 border border-br-secondary rounded-lg lg:rounded-xl text-gray-700 bg-white dark:bg-bg-surface  hover:shadow-token-md hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        title="Continue with Google"
                    >
                        <FontAwesomeIcon
                            icon={faGoogle}
                            size="lg"
                            style={{ color: "#EA4335" }}
                        />
                        <span className="font-medium hidden xl:inline">
                            Continue with Google
                        </span>
                    </button>

                    <button
                        onClick={() => handleOAuthSignIn("facebook")}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 lg:gap-3 py-2 lg:py-3 px-3 lg:px-4 border border-br-secondary rounded-lg lg:rounded-xl text-gray-700 bg-white dark:bg-bg-surface hover:shadow-token-md hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        title="Continue with Facebook"
                    >
                        <FontAwesomeIcon
                            icon={faFacebook}
                            size="lg"
                            style={{ color: "#1877F2" }}
                        />
                        <span className="font-medium hidden xl:inline">
                            Continue with Facebook
                        </span>
                    </button>

                    <button
                        onClick={() => handleOAuthSignIn("twitter")}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 lg:gap-3 py-2 lg:py-3 px-3 lg:px-4 border border-br-secondary rounded-lg lg:rounded-xl text-gray-700 bg-white dark:bg-bg-surface hover:shadow-token-md hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        title="Continue with Twitter"
                    >
                        <FontAwesomeIcon
                            icon={faTwitter}
                            size="xl"
                            style={{ color: "#1DA1F2" }}
                        />
                        <span className="font-medium hidden xl:inline">
                            Continue with Twitter
                        </span>
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
                        className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-semibold transition-all duration-200 hover:scale-105 hover:underline"
                    >
                        Sign In
                    </button>
                </p>
            </div>
        </div>
    );
};
