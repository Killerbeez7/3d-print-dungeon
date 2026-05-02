import { useState, FormEvent, ChangeEvent } from "react";
import { createPortal } from "react-dom";
import FocusLock from "react-focus-lock";
import { resetPassword } from "@/features/auth/services/authService";
import { handleAuthError, formatErrorForDisplay } from "@/features/auth/utils/errorHandling";
import { Spinner } from "@/features/shared/reusable/Spinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faEnvelope, faCheckCircle, faChevronDown, faChevronUp, faPhone, faComments, faShieldAlt } from "@fortawesome/free-solid-svg-icons";

interface PasswordResetModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const PasswordResetModal = ({ isOpen, onClose }: PasswordResetModalProps) => {
    const [email, setEmail] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);
    const [showAlternatives, setShowAlternatives] = useState<boolean>(false);
    const [comingSoonMessage, setComingSoonMessage] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        
        if (!email.trim()) {
            setError("Please enter your email address");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await resetPassword(email.trim());
            setSuccess(true);
        } catch (err) {
            const errorMessage = handleAuthError(err);
            setError(formatErrorForDisplay(errorMessage));
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            setEmail("");
            setError(null);
            setSuccess(false);
            onClose();
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <div
            className={`fixed inset-0 z-[12000] transition-opacity duration-200 ${
                isOpen ? "opacity-100" : "opacity-0"
            }`}
            onClick={handleClose}
            style={{ pointerEvents: "auto" }}
        >
            {/* Backdrop with blur effect */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            <FocusLock returnFocus>
                <div
                    onClick={(e) => e.stopPropagation()}
                    className={`
                        fixed z-[12001] w-full max-w-md
                        bg-bg-surface text-txt-primary
                        border border-br-secondary rounded-none md:rounded-2xl shadow-2xl
                        left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                        transition-all duration-300 ease-out
                        ${isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"}
                    `}
                >
                    {/* Header */}
                    <div className="relative p-6 pb-4">
                        {/* Close button */}
                        <button
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-bg-tertiary transition-colors duration-200 text-txt-muted hover:text-txt-primary"
                            onClick={handleClose}
                            disabled={loading}
                            aria-label="Close modal"
                        >
                            <FontAwesomeIcon icon={faXmark} size="lg" />
                        </button>

                        {/* Title */}
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold mb-2 text-txt-primary">
                                {success ? "Check Your Email" : "Reset Password"}
                            </h2>
                            <p className="text-txt-secondary text-sm">
                                {success
                                    ? "We've sent you a password reset link"
                                    : "Enter your email to receive a password reset link"}
                            </p>
                        </div>

                        {/* Content */}
                        {success ? (
                            <div className="text-center space-y-4">
                                <div className="flex justify-center">
                                    <FontAwesomeIcon
                                        icon={faCheckCircle}
                                        className="text-green-500 text-4xl"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <p className="text-txt-primary">
                                        We&apos;ve sent a password reset link to:
                                    </p>
                                    <p className="font-medium text-txt-primary break-all">{email}</p>
                                    <p className="text-sm text-txt-secondary">
                                        Click the link in your email to reset your password.
                                        <br />
                                        <span className="text-xs text-txt-muted">
                                            The link will take you to our secure password reset page.
                                        </span>
                                    </p>
                                                                         <div className="mt-4 p-3 bg-bg-muted border border-br-secondary rounded-lg">
                                         <p className="text-sm text-txt-secondary">
                                             <span className="text-txt-muted">💡</span> <strong>Didn&apos;t receive the email?</strong> Check your spam or junk folder.
                                         </p>
                                     </div>
                                 </div>

                                 {/* Try Another Method Section */}
                                 <div className="mt-4">
                                     <button
                                         type="button"
                                         onClick={() => setShowAlternatives(!showAlternatives)}
                                         className="w-full flex items-center justify-between p-3 text-sm text-txt-secondary hover:text-txt-primary hover:bg-bg-muted rounded-lg transition-colors duration-200"
                                     >
                                         <span className="font-medium">Try another method</span>
                                         <FontAwesomeIcon 
                                             icon={showAlternatives ? faChevronUp : faChevronDown} 
                                             className="text-txt-muted"
                                         />
                                     </button>
                                     
                                     {showAlternatives && (
                                         <div className="mt-2 space-y-2">
                                             <button
                                                 type="button"
                                                 onClick={() => {
                                                     setComingSoonMessage("SMS Verification");
                                                     setTimeout(() => setComingSoonMessage(null), 3000);
                                                 }}
                                                 className="w-full flex items-center p-3 text-left text-sm text-txt-primary hover:bg-bg-muted hover:text-link rounded-lg transition-colors duration-200 border border-br-secondary"
                                             >
                                                 <FontAwesomeIcon icon={faPhone} className="mr-3 text-info" />
                                                 <div>
                                                     <div className="font-medium">SMS Verification</div>
                                                     <div className="text-xs text-txt-muted">Receive a code via text message</div>
                                                 </div>
                                             </button>
                                             
                                             <button
                                                 type="button"
                                                 onClick={() => {
                                                     setComingSoonMessage("Live Chat Support");
                                                     setTimeout(() => setComingSoonMessage(null), 3000);
                                                 }}
                                                 className="w-full flex items-center p-3 text-left text-sm text-txt-primary hover:bg-bg-muted hover:text-success rounded-lg transition-colors duration-200 border border-br-secondary"
                                             >
                                                 <FontAwesomeIcon icon={faComments} className="mr-3 text-green-500" />
                                                 <div>
                                                     <div className="font-medium">Live Chat Support</div>
                                                     <div className="text-xs text-txt-muted">Get help from our support team</div>
                                                 </div>
                                             </button>
                                             
                                             <button
                                                 type="button"
                                                 onClick={() => {
                                                     setComingSoonMessage("Security Questions");
                                                     setTimeout(() => setComingSoonMessage(null), 3000);
                                                 }}
                                                 className="w-full flex items-center p-3 text-left text-sm text-txt-primary hover:bg-accent-soft hover:text-accent-text rounded-lg transition-colors duration-200 border border-br-secondary"
                                             >
                                                 <FontAwesomeIcon icon={faShieldAlt} className="mr-3 text-accent" />
                                                 <div>
                                                     <div className="font-medium">Security Questions</div>
                                                     <div className="text-xs text-txt-muted">Answer your security questions</div>
                                                 </div>
                                             </button>
                                         </div>
                                     )}
                                 </div>

                                 {/* Coming Soon Message */}
                                 {comingSoonMessage && (
                                     <div className="mt-4 p-3 bg-bg-muted border border-br-secondary rounded-lg">
                                         <p className="text-sm text-link text-center">
                                             🚧 <strong>{comingSoonMessage}</strong> - Coming Soon!
                                         </p>
                                     </div>
                                 )}

                                 <button
                                     type="button"
                                     onClick={handleClose}
                                     className="w-full py-3 px-4 bg-btn-primary text-btn-primary-text rounded-xl hover:bg-btn-primary-hover transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-focus focus:ring-offset-2"
                                 >
                                     Got it
                                 </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Email field */}
                                <div className="relative">
                                    <div className="relative">
                                        <FontAwesomeIcon
                                            icon={faEnvelope}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-muted"
                                        />
                                        <input
                                            id="reset-email"
                                            name="email"
                                            type="email"
                                            value={email}
                                            onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                                            required
                                            spellCheck="false"
                                            autoComplete="email"
                                            className="w-full pl-10 pr-4 py-3 border border-br-secondary rounded-xl bg-bg-surface placeholder-txt-muted focus:outline-none focus:ring-2 focus:ring-focus focus:border-focus transition-all duration-200"
                                            placeholder="Enter your email"
                                            disabled={loading}
                                        />
                                    </div>
                                </div>

                                {/* Error message */}
                                {error && (
                                    <div className="flex items-center p-3 bg-bg-muted border border-error rounded-xl">
                                        <p className="text-red-700 text-sm font-medium">
                                            {error}
                                        </p>
                                    </div>
                                )}

                                                                 {/* Submit button */}
                                 <button
                                     type="submit"
                                     disabled={loading || !email.trim()}
                                     className="w-full py-3 px-4 bg-btn-primary text-btn-primary-text rounded-xl hover:bg-btn-primary-hover disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-focus focus:ring-offset-2"
                                 >
                                     {loading ? (
                                         <div className="flex items-center justify-center">
                                             <Spinner size={18} />
                                             <span className="ml-2">Sending...</span>
                                         </div>
                                     ) : (
                                         "Send Reset Link"
                                     )}
                                 </button>

                                 {/* Alternative Methods */}
                                 <div className="mt-4">
                                     <button
                                         type="button"
                                         onClick={() => setShowAlternatives(!showAlternatives)}
                                         className="w-full flex items-center justify-between p-3 text-sm text-txt-secondary hover:text-txt-primary hover:bg-bg-muted rounded-lg transition-colors duration-200"
                                     >
                                         <span className="font-medium">Need help? Try another method</span>
                                         <FontAwesomeIcon 
                                             icon={showAlternatives ? faChevronUp : faChevronDown} 
                                             className="text-txt-muted"
                                         />
                                     </button>
                                     
                                     {showAlternatives && (
                                         <div className="mt-2 space-y-2">
                                             <button
                                                 type="button"
                                                 onClick={() => {
                                                     setComingSoonMessage("SMS Verification");
                                                     setTimeout(() => setComingSoonMessage(null), 3000);
                                                 }}
                                                 className="w-full flex items-center p-3 text-left text-sm text-txt-primary hover:bg-bg-muted hover:text-link rounded-lg transition-colors duration-200 border border-br-secondary"
                                             >
                                                 <FontAwesomeIcon icon={faPhone} className="mr-3 text-info" />
                                                 <div>
                                                     <div className="font-medium">SMS Verification</div>
                                                     <div className="text-xs text-txt-muted">Receive a code via text message</div>
                                                 </div>
                                             </button>
                                             
                                             <button
                                                 type="button"
                                                 onClick={() => {
                                                     setComingSoonMessage("Live Chat Support");
                                                     setTimeout(() => setComingSoonMessage(null), 3000);
                                                 }}
                                                 className="w-full flex items-center p-3 text-left text-sm text-txt-primary hover:bg-bg-muted hover:text-success rounded-lg transition-colors duration-200 border border-br-secondary"
                                             >
                                                 <FontAwesomeIcon icon={faComments} className="mr-3 text-green-500" />
                                                 <div>
                                                     <div className="font-medium">Live Chat Support</div>
                                                     <div className="text-xs text-txt-muted">Get help from our support team</div>
                                                 </div>
                                             </button>
                                             
                                             <button
                                                 type="button"
                                                 onClick={() => {
                                                     setComingSoonMessage("Security Questions");
                                                     setTimeout(() => setComingSoonMessage(null), 3000);
                                                 }}
                                                 className="w-full flex items-center p-3 text-left text-sm text-txt-primary hover:bg-accent-soft hover:text-accent-text rounded-lg transition-colors duration-200 border border-br-secondary"
                                             >
                                                 <FontAwesomeIcon icon={faShieldAlt} className="mr-3 text-accent" />
                                                 <div>
                                                     <div className="font-medium">Security Questions</div>
                                                     <div className="text-xs text-txt-muted">Answer your security questions</div>
                                                 </div>
                                             </button>
                                         </div>
                                     )}
                                 </div>

                                 {/* Coming Soon Message */}
                                 {comingSoonMessage && (
                                     <div className="mt-4 p-3 bg-bg-muted border border-br-secondary rounded-lg">
                                         <p className="text-sm text-link text-center">
                                             🚧 <strong>{comingSoonMessage}</strong> - Coming Soon!
                                         </p>
                                     </div>
                                 )}
                             </form>
                         )}
                    </div>
                </div>
            </FocusLock>
        </div>,
        document.body
    );
};
