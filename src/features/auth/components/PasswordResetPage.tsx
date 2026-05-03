import { useState, FormEvent, ChangeEvent, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { auth } from "@/config/firebaseConfig";
import { handleAuthError, formatErrorForDisplay } from "@/features/auth/utils/errorHandling";
import { Spinner } from "@/features/shared/reusable/Spinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faLock, faCheckCircle, faExclamationTriangle, faChevronDown, faChevronUp, faPhone, faComments, faShieldAlt } from "@fortawesome/free-solid-svg-icons";

export const PasswordResetPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState<boolean>(true);
    const [verifying, setVerifying] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);
    const [email, setEmail] = useState<string>("");
    const [newPassword, setNewPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
    const [passwordStrength, setPasswordStrength] = useState<{
        score: number;
        feedback: string[];
    }>({ score: 0, feedback: [] });
    const [showAlternatives, setShowAlternatives] = useState<boolean>(false);
    const [comingSoonMessage, setComingSoonMessage] = useState<string | null>(null);

    const oobCode = searchParams.get("oobCode");
    const mode = searchParams.get("mode");

    useEffect(() => {
        const verifyCode = async () => {
            if (!oobCode || mode !== "resetPassword") {
                setError("Invalid or expired password reset link.");
                setLoading(false);
                return;
            }

            try {
                const email = await verifyPasswordResetCode(auth, oobCode);
                setEmail(email);
                setLoading(false);
            } catch (err) {
                const errorMessage = handleAuthError(err);
                setError(formatErrorForDisplay(errorMessage));
                setLoading(false);
            }
        };

        verifyCode();
    }, [oobCode, mode]);

    const checkPasswordStrength = (password: string) => {
        const feedback: string[] = [];
        let score = 0;

        if (password.length >= 8) {
            score += 1;
        } else {
            feedback.push("At least 8 characters");
        }

        if (/[a-z]/.test(password)) {
            score += 1;
        } else {
            feedback.push("Include lowercase letters");
        }

        if (/[A-Z]/.test(password)) {
            score += 1;
        } else {
            feedback.push("Include uppercase letters");
        }

        if (/[0-9]/.test(password)) {
            score += 1;
        } else {
            feedback.push("Include numbers");
        }

        if (/[^A-Za-z0-9]/.test(password)) {
            score += 1;
        } else {
            feedback.push("Include special characters");
        }

        setPasswordStrength({ score, feedback });
    };

    const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setNewPassword(value);
        checkPasswordStrength(value);
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!oobCode) {
            setError("Invalid reset link.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (passwordStrength.score < 3) {
            setError("Please choose a stronger password.");
            return;
        }

        setVerifying(true);
        setError(null);

        try {
            await confirmPasswordReset(auth, oobCode, newPassword);
            setSuccess(true);
        } catch (err) {
            const errorMessage = handleAuthError(err);
            setError(formatErrorForDisplay(errorMessage));
        } finally {
            setVerifying(false);
        }
    };

    const getStrengthColor = () => {
        if (passwordStrength.score <= 2) return "text-error";
        if (passwordStrength.score <= 3) return "text-yellow-500";
        if (passwordStrength.score <= 4) return "text-info";
        return "text-green-500";
    };

    const getStrengthText = () => {
        if (passwordStrength.score <= 2) return "Weak";
        if (passwordStrength.score <= 3) return "Fair";
        if (passwordStrength.score <= 4) return "Good";
        return "Strong";
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-bg-page flex items-center justify-center p-4">
                <div className="bg-bg-surface rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="flex items-center justify-center mb-4">
                        <Spinner size={32} />
                    </div>
                    <p className="text-txt-secondary">Verifying your reset link...</p>
                </div>
            </div>
        );
    }

    if (error && !success) {
        return (
            <div className="min-h-screen bg-bg-page flex items-center justify-center p-4">
                <div className="bg-bg-surface rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="flex justify-center mb-4">
                        <FontAwesomeIcon
                            icon={faExclamationTriangle}
                            className="text-error text-4xl"
                        />
                    </div>
                    <h1 className="text-2xl font-bold text-txt-primary mb-2">Reset Link Invalid</h1>
                    <p className="text-txt-secondary mb-6">{error}</p>
                    
                                         {/* Alternative Methods */}
                     <div className="mb-6">
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

                         {/* Coming Soon Message */}
                         {comingSoonMessage && (
                             <div className="mt-4 p-3 bg-bg-muted border border-br-secondary rounded-lg">
                                 <p className="text-sm text-link text-center">
                                     🚧 <strong>{comingSoonMessage}</strong> - Coming Soon!
                                 </p>
                             </div>
                         )}
                     </div>

                    <button
                        onClick={() => navigate("/")}
                        className="w-full py-3 px-4 bg-btn-primary text-btn-primary-text rounded-xl hover:bg-btn-primary-hover transition-colors duration-200"
                    >
                        Go to Home
                    </button>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-bg-page flex items-center justify-center p-4">
                <div className="bg-bg-surface rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="flex justify-center mb-4">
                        <FontAwesomeIcon
                            icon={faCheckCircle}
                            className="text-green-500 text-4xl"
                        />
                    </div>
                    <h1 className="text-2xl font-bold text-txt-primary mb-2">Password Reset Successfully!</h1>
                    <p className="text-txt-secondary mb-6">
                        Your password has been updated. You can now sign in with your new password.
                    </p>
                    <button
                        onClick={() => navigate("/")}
                        className="w-full py-3 px-4 bg-btn-primary text-btn-primary-text rounded-xl hover:bg-btn-primary-hover transition-colors duration-200"
                    >
                        Sign In
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg-page flex items-center justify-center p-4">
            <div className="bg-bg-surface rounded-2xl shadow-xl p-8 max-w-md w-full">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-txt-primary mb-2">Reset Your Password</h1>
                    <p className="text-txt-secondary text-sm">
                        Enter your new password below
                    </p>
                    {email && (
                        <p className="text-sm text-txt-muted mt-2">
                            Resetting password for: <span className="font-medium">{email}</span>
                        </p>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* New Password */}
                    <div className="relative">
                        <div className="relative">
                            <FontAwesomeIcon
                                icon={faLock}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-muted"
                            />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={newPassword}
                                onChange={handlePasswordChange}
                                required
                                className="w-full pl-10 pr-12 py-3 border border-br-secondary rounded-xl bg-bg-surface placeholder-txt-muted focus:outline-none focus:ring-2 focus:ring-focus focus:border-focus transition-all duration-200"
                                placeholder="New password"
                                disabled={verifying}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-txt-muted hover:text-txt-secondary transition-colors duration-200"
                            >
                                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                            </button>
                        </div>
                        
                        {/* Password Strength Indicator */}
                        {newPassword && (
                            <div className="mt-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-txt-secondary">Password strength:</span>
                                    <span className={`font-medium ${getStrengthColor()}`}>
                                        {getStrengthText()}
                                    </span>
                                </div>
                                <div className="mt-1 flex space-x-1">
                                    {[1, 2, 3, 4, 5].map((level) => (
                                        <div
                                            key={level}
                                            className={`h-1 flex-1 rounded-full ${
                                                level <= passwordStrength.score
                                                    ? getStrengthColor().replace("text-", "bg-")
                                                    : "bg-bg-muted"
                                            }`}
                                        />
                                    ))}
                                </div>
                                {passwordStrength.feedback.length > 0 && (
                                    <ul className="mt-2 text-xs text-txt-muted space-y-1">
                                        {passwordStrength.feedback.map((feedback, index) => (
                                            <li key={index} className="flex items-center">
                                                <span className="text-red-400 mr-1">•</span>
                                                {feedback}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div className="relative">
                        <div className="relative">
                            <FontAwesomeIcon
                                icon={faLock}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-muted"
                            />
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="w-full pl-10 pr-12 py-3 border border-br-secondary rounded-xl bg-bg-surface placeholder-txt-muted focus:outline-none focus:ring-2 focus:ring-focus focus:border-focus transition-all duration-200"
                                placeholder="Confirm new password"
                                disabled={verifying}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-txt-muted hover:text-txt-secondary transition-colors duration-200"
                            >
                                <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                            </button>
                        </div>
                        {confirmPassword && newPassword !== confirmPassword && (
                            <p className="mt-1 text-sm text-error-hover">Passwords do not match</p>
                        )}
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="flex items-center p-3 bg-bg-muted border border-error rounded-xl">
                            <FontAwesomeIcon
                                icon={faExclamationTriangle}
                                className="text-error mr-2"
                            />
                            <p className="text-red-700 text-sm font-medium">
                                {error}
                            </p>
                        </div>
                    )}

                    {/* Submit button */}
                    <button
                        type="submit"
                        disabled={verifying || !newPassword || !confirmPassword || newPassword !== confirmPassword || passwordStrength.score < 3}
                        className="w-full py-3 px-4 bg-btn-primary text-btn-primary-text rounded-xl hover:bg-btn-primary-hover disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-focus focus:ring-offset-2"
                    >
                        {verifying ? (
                            <div className="flex items-center justify-center">
                                <Spinner size={18} />
                                <span className="ml-2">Updating Password...</span>
                            </div>
                        ) : (
                            "Update Password"
                        )}
                    </button>
                </form>

                                 {/* Alternative Methods */}
                 <div className="mt-6">
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

                     {/* Coming Soon Message */}
                     {comingSoonMessage && (
                         <div className="mt-4 p-3 bg-bg-muted border border-br-secondary rounded-lg">
                             <p className="text-sm text-link text-center">
                                 🚧 <strong>{comingSoonMessage}</strong> - Coming Soon!
                             </p>
                         </div>
                     )}
                 </div>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => navigate("/")}
                        className="text-sm text-txt-secondary hover:text-link transition-colors duration-200"
                    >
                        Back to Sign In
                    </button>
                </div>
            </div>
        </div>
    );
};
