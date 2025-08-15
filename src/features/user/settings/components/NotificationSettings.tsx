import { useState, useEffect } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useNotification } from "@/features/notifications";
import { settingsService } from "../services/settingsService";
import { SaveChanges } from "./parts/SaveChanges";

export const NotificationSettings = () => {
    const { currentUser } = useAuth();
    const { success, error: showError } = useNotification();
    const [loading, setLoading] = useState<boolean>(false);
    const [hasChanges, setHasChanges] = useState<boolean>(false);
    
    // Notification settings state
    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        marketing: false,
        newFollowers: true,
        newLikes: true,
        newComments: true,
        modelUpdates: true,
    });

    // Original settings for comparison
    const [originalNotifications, setOriginalNotifications] = useState({
        email: true,
        push: true,
        marketing: false,
        newFollowers: true,
        newLikes: true,
        newComments: true,
        modelUpdates: true,
    });

    // Load notification settings on component mount
    useEffect(() => {
        const loadNotificationSettings = async () => {
            if (!currentUser?.uid) return;
            
            try {
                const userSettings = await settingsService.getUserSettings(currentUser.uid);
                if (userSettings?.notifications) {
                    setNotifications(userSettings.notifications);
                    setOriginalNotifications(userSettings.notifications);
                }
            } catch (err) {
                console.error("Error loading notification settings:", err);
                showError("Settings Load Error", "Failed to load notification settings");
            }
        };

        loadNotificationSettings();
    }, [currentUser, showError]);

    // Check for changes
    useEffect(() => {
        const hasChanges = JSON.stringify(notifications) !== JSON.stringify(originalNotifications);
        setHasChanges(hasChanges);
    }, [notifications, originalNotifications]);

    const handleNotificationChange = (setting: string, value: boolean) => {
        setNotifications(prev => ({
            ...prev,
            [setting]: value
        }));
    };

    const handleSave = async () => {
        if (!currentUser?.uid || !hasChanges) return;
        
        setLoading(true);
        try {
            await settingsService.updateUserSettings(currentUser.uid, {
                notifications: notifications
            });
            
            setOriginalNotifications(notifications);
            setHasChanges(false);
            success("Notifications Updated", "Notification settings saved successfully");
        } catch (err) {
            console.error("Error updating notification settings:", err);
            showError("Notification Update Error", "Failed to save notification settings");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setNotifications(originalNotifications);
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
                disabled={loading}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 ${
                    enabled ? 'bg-accent' : 'bg-br-secondary'
                } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
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
                <h2 className="text-2xl font-bold text-txt-primary mb-2">Notification Settings</h2>
                <p className="text-txt-secondary text-sm">
                    Manage how and when you receive notifications
                </p>
            </div>

            {/* Notification Channels */}
            <div className="bg-bg-surface rounded-lg border border-br-secondary overflow-hidden">
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-txt-primary mb-4">Notification Channels</h3>
                    
                    <ToggleSwitch
                        enabled={notifications.email}
                        onChange={(enabled) => handleNotificationChange('email', enabled)}
                        label="Email Notifications"
                        description="Receive notifications via email"
                    />

                    <ToggleSwitch
                        enabled={notifications.push}
                        onChange={(enabled) => handleNotificationChange('push', enabled)}
                        label="Push Notifications"
                        description="Receive notifications in your browser"
                    />

                    <ToggleSwitch
                        enabled={notifications.marketing}
                        onChange={(enabled) => handleNotificationChange('marketing', enabled)}
                        label="Marketing Emails"
                        description="Receive promotional content and updates"
                    />
                </div>
            </div>

            {/* Social Notifications */}
            <div className="bg-bg-surface rounded-lg border border-br-secondary overflow-hidden">
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-txt-primary mb-4">Social Activity</h3>
                    
                    <ToggleSwitch
                        enabled={notifications.newFollowers}
                        onChange={(enabled) => handleNotificationChange('newFollowers', enabled)}
                        label="New Followers"
                        description="When someone follows your profile"
                    />

                    <ToggleSwitch
                        enabled={notifications.newLikes}
                        onChange={(enabled) => handleNotificationChange('newLikes', enabled)}
                        label="New Likes"
                        description="When someone likes your content"
                    />

                    <ToggleSwitch
                        enabled={notifications.newComments}
                        onChange={(enabled) => handleNotificationChange('newComments', enabled)}
                        label="New Comments"
                        description="When someone comments on your content"
                    />
                </div>
            </div>

            {/* Content Updates */}
            <div className="bg-bg-surface rounded-lg border border-br-secondary overflow-hidden">
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-txt-primary mb-4">Content & Updates</h3>
                    
                    <ToggleSwitch
                        enabled={notifications.modelUpdates}
                        onChange={(enabled) => handleNotificationChange('modelUpdates', enabled)}
                        label="Model Updates"
                        description="When models you follow are updated"
                    />
                </div>
            </div>

            {/* Notification Preferences Info */}
            <div className="bg-bg-secondary rounded-lg border border-br-secondary p-4">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-txt-secondary" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-txt-primary">Notification Preferences</h3>
                        <div className="mt-2 text-sm text-txt-secondary">
                            <p>
                                You can customize which notifications you receive. Some important account-related notifications 
                                cannot be disabled for security reasons.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Save Buttons */}
            <SaveChanges
                hasChanges={hasChanges}
                loading={loading}
                onSave={handleSave}
                onReset={handleReset}
            />
        </div>
    );
};
