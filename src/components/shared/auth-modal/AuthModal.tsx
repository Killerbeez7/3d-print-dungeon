import { useState, useEffect, FormEvent, MouseEvent } from "react";
import { createPortal } from "react-dom";
import FocusLock from "react-focus-lock";
//hooks
import { useAuth } from "@/hooks/useAuth";
import { useModal } from "@/hooks/useModal";
import { Spinner } from "@/components/shared/Spinner";
//icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle, faTwitter, faFacebook } from "@fortawesome/free-brands-svg-icons";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

interface OAuthIcon {
    fn: () => Promise<void>;
    icon: typeof faGoogle;
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
        { fn: handleFacebookSignIn, icon: faFacebook },
        { fn: handleGoogleSignIn, icon: faGoogle },
        { fn: handleTwitterSignIn, icon: faTwitter },
    ];

    /* form state */
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPass] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

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

    if (!isOpen) return null;

    /* helpers */
    function resetFields(): void {
        setEmail("");
        setPassword("");
        setConfirmPass("");
        setError(null);
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
            className="fixed inset-0 z-[11000]"
            onClick={handleClose}
            style={{ pointerEvents: "auto" }}
        >
            <div className="absolute inset-0 bg-black/60" />

            <FocusLock returnFocus>
                <div
                    onClick={(e: MouseEvent<HTMLDivElement>) => e.stopPropagation()}
                    className="
               fixed z-[11001] w-full max-w-md p-6
               bg-bg-surface text-txt-primary
               border border-br-primary rounded-[10px] shadow-lg
               left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                >
                    {/* close btn */}
                    <button
                        className="absolute top-3 right-3 text-txt-secondary hover:text-error"
                        onClick={handleClose}
                    >
                        <FontAwesomeIcon icon={faXmark} size="lg" />
                    </button>

                    {/* title */}
                    <h2 className="text-center text-2xl font-bold mb-5">
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
                                    onChange={(e) => setConfirmPass(e.target.value)}
                                    className="
                       w-full px-3 py-2 mt-1
                       border-2 border-br-primary rounded-[10px]
                       bg-bgPrimary text-txt-primary
                       focus:outline-none focus:border-focus focus:ring-focus"
                                />
                            </label>
                        )}

                        {/* error */}
                        <div className="h-6 mb-2">
                            {error && (
                                <p className="text-center text-error font-semibold">
                                    {error}
                                </p>
                            )}
                        </div>

                        {/* submit */}
                        <button type="submit" className="w-full py-2 cta-button">
                            {loading ? (
                                <Spinner size={18} />
                            ) : mode === "signup" ? (
                                "Create Account"
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>

                    {/* social login */}
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
                                {OAUTH_ICONS.map(({ fn, icon }) => (
                                    <button
                                        key={icon.iconName}
                                        onClick={() => oauth(fn)}
                                        className="w-10 h-10 flex items-center justify-center
                                  rounded-full border border-br-primary
                                  hover:bg-[var(--color-btn-primary-hover)]
                                  transition-colors"
                                    >
                                        <FontAwesomeIcon icon={icon} />
                                    </button>
                                ))}
                            </div>
                        </>
                    )}

                    {/* switch mode */}
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
            </FocusLock>
        </div>,
        document.body
    );
}
