import { useState, useEffect, FormEvent, MouseEvent } from "react";
import { createPortal } from "react-dom";
import FocusLock from "react-focus-lock";
//hooks
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useModal } from "@/hooks/useModal";
import { Spinner } from "@/features/shared/reusable/Spinner";
//icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle, faTwitter, faFacebook } from "@fortawesome/free-brands-svg-icons";
import { 
    faXmark, 
    faEye, 
    faEyeSlash, 
    faEnvelope, 
    faLock, 
    faUser,
    faCheckCircle,
    faExclamationTriangle
} from "@fortawesome/free-solid-svg-icons";

interface OAuthIcon {
    fn: () => Promise<void>;
    icon: typeof faGoogle;
    label: string;
    color: string;
}

export function AuthModal() {
    const { isOpen, payload, close, toggle } = useModal("auth");
    const mode: "signup" | "login" = payload?.mode === "signup" ? "signup" : "login";

    /* auth handlers */
    const {
        handleEmailSignUp,
        handleEmailSignIn,
        handleGoogleSignIn,
        handleFacebookSignIn,
        handleTwitterSignIn,
    } = useAuth();

    const OAUTH_ICONS: OAuthIcon[] = [
        { 
            fn: handleGoogleSignIn, 
            icon: faGoogle, 
            label: "Continue with Google",
            color: "hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-200 dark:hover:border-red-800 text-red-600 dark:text-red-400"
        },
        { 
            fn: handleFacebookSignIn, 
            icon: faFacebook, 
            label: "Continue with Facebook",
            color: "hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-800 text-blue-600 dark:text-blue-400"
        },
        { 
            fn: handleTwitterSignIn, 
            icon: faTwitter, 
            label: "Continue with Twitter",
            color: "hover:bg-sky-50 dark:hover:bg-sky-900/20 hover:border-sky-200 dark:hover:border-sky-800 text-sky-600 dark:text-sky-400"
        },
    ];

    /* form state */
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPass] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
    const [isVisible, setIsVisible] = useState<boolean>(false);

    /* keyboard: ESC closes */
    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && handleClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isOpen]);

    /* block background scroll */
    useEffect(() => {
        if (!isOpen) return;
        const block = (e: Event) => {
            const el = document.activeElement as HTMLElement | null;
            if (
                el &&
                (el.tagName === "INPUT" ||
                    el.tagName === "TEXTAREA" ||
                    (el as HTMLElement).isContentEditable)
            )
                return;
            e.preventDefault();
        };
        window.addEventListener("wheel", block, { passive: false });
        window.addEventListener("touchmove", block, { passive: false });
        return () => {
            window.removeEventListener("wheel", block);
            window.removeEventListener("touchmove", block);
        };
    }, [isOpen]);

    /* animation effect */
    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        } else {
            const timer = setTimeout(() => setIsVisible(false), 200);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isOpen && !isVisible) return null;

    /* helpers */
    function resetFields(): void {
        setEmail("");
        setPassword("");
        setConfirmPass("");
        setError(null);
        setShowPassword(false);
        setShowConfirmPassword(false);
    }
    
    function handleClose(): void {
        resetFields();
        close();
    }

    async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
        e.preventDefault();
        setError(null);
        setLoading(true);

        if (mode === "signup" && password !== confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        if (mode === "signup" && password.length < 8) {
            setError("Password must be at least 8 characters long");
            setLoading(false);
            return;
        }

        try {
            if (mode === "signup") {
                await handleEmailSignUp(email, password);
            } else {
                await handleEmailSignIn(email, password);
            }
            handleClose();
        } catch (err) {
            setError((err as Error).message);
            setLoading(false);
        }
    }

    async function oauth(fn: () => Promise<void>): Promise<void> {
        try {
            setError(null);
            setLoading(true);
            await fn();
            handleClose();
        } catch (err) {
            setError((err as Error).message);
            setLoading(false);
        }
    }

    return createPortal(
        <div
            className={`fixed inset-0 z-[11000] transition-opacity duration-200 ${
                isOpen ? "opacity-100" : "opacity-0"
            }`}
            onClick={handleClose}
            style={{ pointerEvents: "auto" }}
        >
            {/* Backdrop with blur effect */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            <FocusLock returnFocus>
                <div
                    onClick={(e: MouseEvent<HTMLDivElement>) => e.stopPropagation()}
                    className={`
                        fixed z-[11001] w-full max-w-md mx-4
                        bg-white dark:bg-gray-900 text-gray-900 dark:text-white
                        border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl
                        left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                        transition-all duration-300 ease-out
                        ${isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"}
                    `}
                >
                    {/* Header */}
                    <div className="relative p-6 pb-4">
                        {/* Close button */}
                        <button
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            onClick={handleClose}
                            aria-label="Close modal"
                        >
                            <FontAwesomeIcon icon={faXmark} size="lg" />
                        </button>

                        {/* Title */}
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                                {mode === "signup" ? "Create Account" : "Welcome Back"}
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                {mode === "signup" 
                                    ? "Join our community of 3D printing enthusiasts" 
                                    : "Sign in to access your account"
                                }
                            </p>
                        </div>

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
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-600 focus:border-slate-600 dark:focus:ring-slate-400 dark:focus:border-slate-400 transition-all duration-200"
                                        placeholder="Enter your email"
                                    />
                                </div>
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
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-600 focus:border-slate-600 dark:focus:ring-slate-400 dark:focus:border-slate-400 transition-all duration-200"
                                        placeholder="Enter your password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors duration-200"
                                    >
                                        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password field (signup only) */}
                            {mode === "signup" && (
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
                                            type={showConfirmPassword ? "text" : "password"}
                                            required
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPass(e.target.value)}
                                            className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-600 focus:border-slate-600 dark:focus:ring-slate-400 dark:focus:border-slate-400 transition-all duration-200"
                                            placeholder="Confirm your password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors duration-200"
                                        >
                                            <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Error message */}
                            {error && (
                                <div className="flex items-center p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 mr-2" />
                                    <p className="text-red-700 dark:text-red-400 text-sm font-medium">
                                        {error}
                                    </p>
                                </div>
                            )}

                            {/* Submit button */}
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full py-3 px-4 bg-slate-700 hover:bg-slate-800 disabled:bg-slate-500 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-slate-600 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center">
                                        <Spinner size={18} />
                                        <span className="ml-2">Processing...</span>
                                    </div>
                                ) : mode === "signup" ? (
                                    "Create Account"
                                ) : (
                                    "Sign In"
                                )}
                            </button>
                        </form>

                        {/* Social login */}
                        {mode === "login" && (
                            <div className="mt-6">
                                <div className="flex items-center mb-4">
                                    <hr className="flex-grow border-gray-300 dark:border-gray-600" />
                                    <span className="mx-4 text-sm text-gray-500 dark:text-gray-400 font-medium">
                                        Or continue with
                                    </span>
                                    <hr className="flex-grow border-gray-300 dark:border-gray-600" />
                                </div>

                                <div className="space-y-3">
                                    {OAUTH_ICONS.map(({ fn, icon, label, color }) => (
                                        <button
                                            key={icon.iconName}
                                            onClick={() => oauth(fn)}
                                            disabled={loading}
                                            className={`w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${color}`}
                                        >
                                            <FontAwesomeIcon icon={icon} size="lg" />
                                            <span className="font-medium">{label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Switch mode */}
                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {mode === "signup" ? (
                                    <>
                                        Already have an account?{" "}
                                        <button
                                            onClick={() => toggle({ mode: "login" })}
                                            className="text-slate-700 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-200 font-semibold transition-colors duration-200"
                                        >
                                            Sign In
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        Don&apos;t have an account?{" "}
                                        <button
                                            onClick={() => toggle({ mode: "signup" })}
                                            className="text-slate-700 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-200 font-semibold transition-colors duration-200"
                                        >
                                            Sign Up
                                        </button>
                                    </>
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            </FocusLock>
        </div>,
        document.body
    );
}
