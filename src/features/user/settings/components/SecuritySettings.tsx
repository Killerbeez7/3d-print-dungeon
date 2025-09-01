import { useState, FormEvent, ChangeEvent, useEffect } from "react";
import { changePassword } from "@/features/auth/services/authService";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useSystemAlert } from "@/features/system-alerts";
import { settingsService } from "../services/settingsService";
import { SaveChanges } from "./parts/SaveChanges";

export const SecuritySettings = () => {
    const { currentUser } = useAuth();
    const { success, error: showError } = useSystemAlert();
    const [currentPassword, setCurrentPassword] = useState<string>("");
    const [newPassword, setNewPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [errorField, setErrorField] = useState<string>("");
    
    // Security settings state
    const [twoFactorEnabled, setTwoFactorEnabled] = useState<boolean>(false);
    const [sessionTimeout, setSessionTimeout] = useState<number>(60);
    const [loginNotifications, setLoginNotifications] = useState<boolean>(true);
    const [securityLoading, setSecurityLoading] = useState<boolean>(false);
    const [hasChanges, setHasChanges] = useState<boolean>(false);

    // Original settings for comparison
    const [originalSecurity, setOriginalSecurity] = useState({
        twoFactorEnabled: false,
        sessionTimeout: 60,
        loginNotifications: true,
    });

    // Load security settings on component mount
    useEffect(() => {
        const loadSecuritySettings = async () => {
            if (!currentUser?.uid) return;
            
            try {
                const userSettings = await settingsService.getUserSettings(currentUser.uid);
                if (userSettings?.security) {
                    setTwoFactorEnabled(userSettings.security.twoFactorEnabled);
                    setSessionTimeout(userSettings.security.sessionTimeout);
                    setLoginNotifications(userSettings.security.loginNotifications);
                    
                    setOriginalSecurity({
                        twoFactorEnabled: userSettings.security.twoFactorEnabled,
                        sessionTimeout: userSettings.security.sessionTimeout,
                        loginNotifications: userSettings.security.loginNotifications,
                    });
                }
            } catch (err) {
                console.error("Error loading security settings:", err);
                showError("Settings Load Error", "Failed to load security settings");
            }
        };

        loadSecuritySettings();
    }, [currentUser, showError]);

    // Check for changes
    useEffect(() => {
        const currentSecurity = {
            twoFactorEnabled,
            sessionTimeout,
            loginNotifications,
        };
        const hasChanges = JSON.stringify(currentSecurity) !== JSON.stringify(originalSecurity);
        setHasChanges(hasChanges);
    }, [twoFactorEnabled, sessionTimeout, loginNotifications, originalSecurity]);

    const handlePasswordChange = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            const errorMessage = "New password and confirm password must match.";
            setError(errorMessage);
            setErrorField("confirmPassword");
            showError("Password Mismatch", errorMessage);
            return;
        }
        if (newPassword.length < 6) {
            const errorMessage = "New password must be at least 6 characters.";
            setError(errorMessage);
            setErrorField("newPassword");
            showError("Password Too Short", errorMessage);
            return;
        }
        setError("");
        setErrorField("");
        setIsLoading(true);
        if (!currentUser) {
            const errorMessage = "You must be logged in to change your password.";
            setError(errorMessage);
            showError("Authentication Error", errorMessage);
            setIsLoading(false);
            return;
        }
        try {
            await changePassword(currentUser, currentPassword, newPassword);
            success("Password Updated", "Your password has been successfully updated.");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err) {
            const errorMessage = (err instanceof Error ? err.message : "") || "";
            if (
                errorMessage.toLowerCase().includes("password is invalid") ||
                errorMessage.toLowerCase().includes("wrong password")
            ) {
                const errorMsg = "The current password is incorrect.";
                setError(errorMsg);
                setErrorField("currentPassword");
                showError("Invalid Password", errorMsg);
            } else {
                const errorMsg = "Error updating password: " + errorMessage;
                setError(errorMsg);
                setErrorField("");
                showError("Password Update Error", errorMsg);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSecuritySettingChange = (setting: string, value: boolean | number) => {
        if (setting === 'twoFactorEnabled') setTwoFactorEnabled(value as boolean);
        if (setting === 'sessionTimeout') setSessionTimeout(value as number);
        if (setting === 'loginNotifications') setLoginNotifications(value as boolean);
    };

    const handleSaveSecurity = async () => {
        if (!currentUser?.uid || !hasChanges) return;
        
        setSecurityLoading(true);
        try {
            await settingsService.updateUserSettings(currentUser.uid, {
                security: {
                    twoFactorEnabled,
                    sessionTimeout,
                    loginNotifications,
                }
            });
            
            setOriginalSecurity({
                twoFactorEnabled,
                sessionTimeout,
                loginNotifications,
            });
            setHasChanges(false);
            success("Security Updated", "Security settings saved successfully");
        } catch (err) {
            console.error("Error updating security settings:", err);
            showError("Security Update Error", "Failed to save security settings");
        } finally {
            setSecurityLoading(false);
        }
    };

    const handleResetSecurity = () => {
        setTwoFactorEnabled(originalSecurity.twoFactorEnabled);
        setSessionTimeout(originalSecurity.sessionTimeout);
        setLoginNotifications(originalSecurity.loginNotifications);
        setHasChanges(false);
    };

    const ToggleSwitch = ({ 
        enabled, 
        onChange, 
        label, 
        description 
    }: {
        enabled: boolean;
        onChange: (enabled: boolean) => void;
        label: string;
        description: string;
    }) => (
        <div className="flex items-center justify-between py-4 border-b border-br-secondary last:border-b-0">
            <div className="flex-1">
                <p className="text-txt-primary text-sm font-medium">{label}</p>
                <p className="text-txt-secondary text-xs mt-1">{description}</p>
            </div>
            <button
                type="button"
                onClick={() => onChange(!enabled)}
                disabled={securityLoading}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 ${
                    enabled ? 'bg-accent' : 'bg-br-secondary'
                } ${securityLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
            </button>
        </div>
    );

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-txt-primary mb-2">Security Settings</h2>
                <p className="text-txt-secondary text-sm">
                    Manage your account security and authentication preferences
                </p>
            </div>

            {/* Security Preferences */}
            <div className="bg-bg-surface rounded-lg border border-br-secondary overflow-hidden">
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-txt-primary mb-4">Security Preferences</h3>
                    
                    <ToggleSwitch
                        enabled={twoFactorEnabled}
                        onChange={(enabled) => handleSecuritySettingChange('twoFactorEnabled', enabled)}
                        label="Two-Factor Authentication"
                        description="Add an extra layer of security to your account"
                    />

                    <ToggleSwitch
                        enabled={loginNotifications}
                        onChange={(enabled) => handleSecuritySettingChange('loginNotifications', enabled)}
                        label="Login Notifications"
                        description="Get notified when someone logs into your account"
                    />

                    <div className="flex items-center justify-between py-4">
                        <div className="flex-1">
                            <p className="text-txt-primary text-sm font-medium">Session Timeout</p>
                            <p className="text-txt-secondary text-xs mt-1">
                                Automatically log out after {sessionTimeout} minutes of inactivity
                            </p>
                        </div>
                        <select
                            value={sessionTimeout}
                            onChange={(e) => handleSecuritySettingChange('sessionTimeout', parseInt(e.target.value))}
                            disabled={securityLoading}
                            className="ml-4 px-3 py-1 border border-br-secondary rounded-md bg-bg-secondary text-txt-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                        >
                            <option value={15}>15 minutes</option>
                            <option value={30}>30 minutes</option>
                            <option value={60}>1 hour</option>
                            <option value={120}>2 hours</option>
                            <option value={240}>4 hours</option>
                            <option value={480}>8 hours</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Password Change */}
            <div className="bg-bg-surface rounded-lg border border-br-secondary overflow-hidden">
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-txt-primary mb-4">Change Password</h3>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="currentPassword" className="block text-sm font-medium text-txt-secondary mb-1">
                                    Current Password
                                </label>
                                <input
                                    type="password"
                                    id="currentPassword"
                                    value={currentPassword}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                        setCurrentPassword(e.target.value)
                                    }
                                    className={`w-full px-3 py-2 rounded-md bg-bg-secondary text-txt-primary focus:outline-none focus:ring-2 focus:ring-accent border ${
                                        errorField === "currentPassword"
                                            ? "border-error"
                                            : "border-br-secondary"
                                    }`}
                                    placeholder="Enter current password"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="newPassword" className="block text-sm font-medium text-txt-secondary mb-1">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    value={newPassword}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                        setNewPassword(e.target.value)
                                    }
                                    className={`w-full px-3 py-2 rounded-md bg-bg-secondary text-txt-primary focus:outline-none focus:ring-2 focus:ring-accent border ${
                                        errorField === "newPassword"
                                            ? "border-error"
                                            : "border-br-secondary"
                                    }`}
                                    placeholder="Enter new password"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-txt-secondary mb-1">
                                Confirm New Password
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                    setConfirmPassword(e.target.value)
                                }
                                className={`w-full px-3 py-2 rounded-md bg-bg-secondary text-txt-primary focus:outline-none focus:ring-2 focus:ring-accent border ${
                                    errorField === "confirmPassword"
                                        ? "border-error"
                                        : "border-br-secondary"
                                }`}
                                placeholder="Confirm new password"
                                required
                            />
                        </div>
                        
                        {error && (
                            <p className="text-error text-sm transition-opacity duration-300">
                                {error}
                            </p>
                        )}
                        
                        <div className="flex justify-start">
                            <button
                                type="submit"
                                className={`px-6 py-2 cta-button ${
                                    isLoading ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                                disabled={isLoading}
                            >
                                {isLoading ? "Updating..." : "Change Password"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Save Buttons for Security Preferences */}
            <SaveChanges
                hasChanges={hasChanges}
                loading={securityLoading}
                onSave={handleSaveSecurity}
                onReset={handleResetSecurity}
                saveText="Save Security Settings"
            />
        </div>
    );
};
