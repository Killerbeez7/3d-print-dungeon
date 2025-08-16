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
        if (passwordStrength.score <= 2) return "text-red-500";
        if (passwordStrength.score <= 3) return "text-yellow-500";
        if (passwordStrength.score <= 4) return "text-blue-500";
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
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="flex items-center justify-center mb-4">
                        <Spinner size={32} />
                    </div>
                    <p className="text-gray-600">Verifying your reset link...</p>
                </div>
            </div>
        );
    }

    if (error && !success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="flex justify-center mb-4">
                        <FontAwesomeIcon
                            icon={faExclamationTriangle}
                            className="text-red-500 text-4xl"
                        />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset Link Invalid</h1>
                    <p className="text-gray-600 mb-6">{error}</p>
                    
                                         {/* Alternative Methods */}
                     <div className="mb-6">
                         <button
                             type="button"
                             onClick={() => setShowAlternatives(!showAlternatives)}
                             className="w-full flex items-center justify-between p-3 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                         >
                             <span className="font-medium">Need help? Try another method</span>
                             <FontAwesomeIcon 
                                 icon={showAlternatives ? faChevronUp : faChevronDown} 
                                 className="text-gray-400"
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
                                     className="w-full flex items-center p-3 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors duration-200 border border-gray-200"
                                 >
                                     <FontAwesomeIcon icon={faPhone} className="mr-3 text-blue-500" />
                                     <div>
                                         <div className="font-medium">SMS Verification</div>
                                         <div className="text-xs text-gray-500">Receive a code via text message</div>
                                     </div>
                                 </button>
                                 
                                 <button
                                     type="button"
                                     onClick={() => {
                                         setComingSoonMessage("Live Chat Support");
                                         setTimeout(() => setComingSoonMessage(null), 3000);
                                     }}
                                     className="w-full flex items-center p-3 text-left text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-lg transition-colors duration-200 border border-gray-200"
                                 >
                                     <FontAwesomeIcon icon={faComments} className="mr-3 text-green-500" />
                                     <div>
                                         <div className="font-medium">Live Chat Support</div>
                                         <div className="text-xs text-gray-500">Get help from our support team</div>
                                     </div>
                                 </button>
                                 
                                 <button
                                     type="button"
                                     onClick={() => {
                                         setComingSoonMessage("Security Questions");
                                         setTimeout(() => setComingSoonMessage(null), 3000);
                                     }}
                                     className="w-full flex items-center p-3 text-left text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition-colors duration-200 border border-gray-200"
                                 >
                                     <FontAwesomeIcon icon={faShieldAlt} className="mr-3 text-purple-500" />
                                     <div>
                                         <div className="font-medium">Security Questions</div>
                                         <div className="text-xs text-gray-500">Answer your security questions</div>
                                     </div>
                                 </button>
                             </div>
                         )}

                         {/* Coming Soon Message */}
                         {comingSoonMessage && (
                             <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                 <p className="text-sm text-blue-700 text-center">
                                     🚧 <strong>{comingSoonMessage}</strong> - Coming Soon!
                                 </p>
                             </div>
                         )}
                     </div>

                    <button
                        onClick={() => navigate("/")}
                        className="w-full py-3 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200"
                    >
                        Go to Home
                    </button>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="flex justify-center mb-4">
                        <FontAwesomeIcon
                            icon={faCheckCircle}
                            className="text-green-500 text-4xl"
                        />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Password Reset Successfully!</h1>
                    <p className="text-gray-600 mb-6">
                        Your password has been updated. You can now sign in with your new password.
                    </p>
                    <button
                        onClick={() => navigate("/")}
                        className="w-full py-3 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200"
                    >
                        Sign In
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset Your Password</h1>
                    <p className="text-gray-600 text-sm">
                        Enter your new password below
                    </p>
                    {email && (
                        <p className="text-sm text-gray-500 mt-2">
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
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={newPassword}
                                onChange={handlePasswordChange}
                                required
                                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                placeholder="New password"
                                disabled={verifying}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                            >
                                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                            </button>
                        </div>
                        
                        {/* Password Strength Indicator */}
                        {newPassword && (
                            <div className="mt-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Password strength:</span>
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
                                                    : "bg-gray-200"
                                            }`}
                                        />
                                    ))}
                                </div>
                                {passwordStrength.feedback.length > 0 && (
                                    <ul className="mt-2 text-xs text-gray-500 space-y-1">
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
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                placeholder="Confirm new password"
                                disabled={verifying}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                            >
                                <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                            </button>
                        </div>
                        {confirmPassword && newPassword !== confirmPassword && (
                            <p className="mt-1 text-sm text-red-600">Passwords do not match</p>
                        )}
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-xl">
                            <FontAwesomeIcon
                                icon={faExclamationTriangle}
                                className="text-red-500 mr-2"
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
                        className="w-full py-3 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
                         className="w-full flex items-center justify-between p-3 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                     >
                         <span className="font-medium">Need help? Try another method</span>
                         <FontAwesomeIcon 
                             icon={showAlternatives ? faChevronUp : faChevronDown} 
                             className="text-gray-400"
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
                                 className="w-full flex items-center p-3 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors duration-200 border border-gray-200"
                             >
                                 <FontAwesomeIcon icon={faPhone} className="mr-3 text-blue-500" />
                                 <div>
                                     <div className="font-medium">SMS Verification</div>
                                     <div className="text-xs text-gray-500">Receive a code via text message</div>
                                 </div>
                             </button>
                             
                             <button
                                 type="button"
                                 onClick={() => {
                                     setComingSoonMessage("Live Chat Support");
                                     setTimeout(() => setComingSoonMessage(null), 3000);
                                 }}
                                 className="w-full flex items-center p-3 text-left text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-lg transition-colors duration-200 border border-gray-200"
                             >
                                 <FontAwesomeIcon icon={faComments} className="mr-3 text-green-500" />
                                 <div>
                                     <div className="font-medium">Live Chat Support</div>
                                     <div className="text-xs text-gray-500">Get help from our support team</div>
                                 </div>
                             </button>
                             
                             <button
                                 type="button"
                                 onClick={() => {
                                     setComingSoonMessage("Security Questions");
                                     setTimeout(() => setComingSoonMessage(null), 3000);
                                 }}
                                 className="w-full flex items-center p-3 text-left text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition-colors duration-200 border border-gray-200"
                             >
                                 <FontAwesomeIcon icon={faShieldAlt} className="mr-3 text-purple-500" />
                                 <div>
                                     <div className="font-medium">Security Questions</div>
                                     <div className="text-xs text-gray-500">Answer your security questions</div>
                                 </div>
                             </button>
                         </div>
                     )}

                     {/* Coming Soon Message */}
                     {comingSoonMessage && (
                         <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                             <p className="text-sm text-blue-700 text-center">
                                 🚧 <strong>{comingSoonMessage}</strong> - Coming Soon!
                             </p>
                         </div>
                     )}
                 </div>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => navigate("/")}
                        className="text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200"
                    >
                        Back to Sign In
                    </button>
                </div>
            </div>
        </div>
    );
};
