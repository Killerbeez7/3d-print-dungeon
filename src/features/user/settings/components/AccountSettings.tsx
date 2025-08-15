import { useState, KeyboardEvent, Dispatch, SetStateAction, useEffect } from "react";
import { useTheme } from "@/features/shared/theme";
import { useNotification } from "@/features/notifications";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { settingsService } from "../services/settingsService";
import { SaveChanges } from "./parts/SaveChanges";

export interface ThemeOption {
    id: string;
    label: string;
}

export interface LanguageOption {
    id: string;
    label: string;
    flag: string;
}

export interface TimezoneOption {
    id: string;
    label: string;
    offset: string;
}

export const AccountSettings = () => {
    const [isThemeOpen, setIsThemeOpen] = useState<boolean>(false);
    const [isLanguageOpen, setIsLanguageOpen] = useState<boolean>(false);
    const [isTimezoneOpen, setIsTimezoneOpen] = useState<boolean>(false);
    const [, setThemeRaw] = useTheme();
    const { success, error: showError } = useNotification();
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState<boolean>(false);
    const [hasChanges, setHasChanges] = useState<boolean>(false);
    
    // Local state for settings
    const [localTheme, setLocalTheme] = useState<string>("system");
    const [localLanguage, setLocalLanguage] = useState<string>("en");
    const [localTimezone, setLocalTimezone] = useState<string>("UTC");
    
    // Original settings for comparison
    const [originalSettings, setOriginalSettings] = useState({
        theme: "system",
        language: "en",
        timezone: "UTC",
    });

    const setTheme: (theme: string) => void =
        typeof setThemeRaw === "function"
            ? (t: string) => (setThemeRaw as Dispatch<SetStateAction<string>>)(t)
            : () => {};

    const themes: ThemeOption[] = [
        { id: "system", label: "OS Default" },
        { id: "light", label: "Light" },
        { id: "dark", label: "Dark" },
    ];

    const languages: LanguageOption[] = [
        { id: "en", label: "English", flag: "🇺🇸" },
        { id: "es", label: "Español", flag: "🇪🇸" },
        { id: "fr", label: "Français", flag: "🇫🇷" },
        { id: "de", label: "Deutsch", flag: "🇩🇪" },
        { id: "it", label: "Italiano", flag: "🇮🇹" },
        { id: "pt", label: "Português", flag: "🇵🇹" },
        { id: "ru", label: "Русский", flag: "🇷🇺" },
        { id: "zh", label: "中文", flag: "🇨🇳" },
        { id: "ja", label: "日本語", flag: "🇯🇵" },
        { id: "ko", label: "한국어", flag: "🇰🇷" },
    ];

    const timezones: TimezoneOption[] = [
        { id: "UTC", label: "UTC (Coordinated Universal Time)", offset: "UTC+0" },
        { id: "America/New_York", label: "Eastern Time", offset: "UTC-5" },
        { id: "America/Chicago", label: "Central Time", offset: "UTC-6" },
        { id: "America/Denver", label: "Mountain Time", offset: "UTC-7" },
        { id: "America/Los_Angeles", label: "Pacific Time", offset: "UTC-8" },
        { id: "Europe/London", label: "London", offset: "UTC+0" },
        { id: "Europe/Paris", label: "Paris", offset: "UTC+1" },
        { id: "Europe/Berlin", label: "Berlin", offset: "UTC+1" },
        { id: "Asia/Tokyo", label: "Tokyo", offset: "UTC+9" },
        { id: "Asia/Shanghai", label: "Shanghai", offset: "UTC+8" },
    ];

    // Load user settings on component mount
    useEffect(() => {
        const loadUserSettings = async () => {
            if (!currentUser?.uid) return;
            
            try {
                const userSettings = await settingsService.getUserSettings(currentUser.uid);
                if (userSettings) {
                    const themeValue = userSettings.theme || "system";
                    const languageValue = userSettings.language || "en";
                    const timezoneValue = userSettings.timezone || "UTC";
                    
                    setLocalTheme(themeValue);
                    setLocalLanguage(languageValue);
                    setLocalTimezone(timezoneValue);
                    
                    setOriginalSettings({
                        theme: themeValue,
                        language: languageValue,
                        timezone: timezoneValue,
                    });
                }
            } catch (err) {
                console.error("Error loading user settings:", err);
                showError("Settings Load Error", "Failed to load user settings");
            }
        };

        loadUserSettings();
    }, [currentUser, showError]);

    // Check for changes
    useEffect(() => {
        const currentSettings = {
            theme: localTheme,
            language: localLanguage,
            timezone: localTimezone,
        };
        const hasChanges = JSON.stringify(currentSettings) !== JSON.stringify(originalSettings);
        setHasChanges(hasChanges);
    }, [localTheme, localLanguage, localTimezone, originalSettings]);

    const handleThemeSelect = (t: ThemeOption): void => {
        setLocalTheme(t.id);
        setIsThemeOpen(false);
    };

    const handleLanguageSelect = (option: { id: string; label: string; flag?: string; offset?: string }): void => {
        const l = option as LanguageOption;
        setLocalLanguage(l.id);
        setIsLanguageOpen(false);
    };

    const handleTimezoneSelect = (option: { id: string; label: string; flag?: string; offset?: string }): void => {
        const tz = option as TimezoneOption;
        setLocalTimezone(tz.id);
        setIsTimezoneOpen(false);
    };

    const handleSave = async () => {
        if (!currentUser?.uid || !hasChanges) return;
        
        setLoading(true);
        try {
            await settingsService.updateUserSettings(currentUser.uid, {
                theme: localTheme as "light" | "dark" | "auto",
                language: localLanguage,
                timezone: localTimezone,
            });
            
            // Update the actual theme in the app
            setTheme(localTheme);
            
            setOriginalSettings({
                theme: localTheme,
                language: localLanguage,
                timezone: localTimezone,
            });
            setHasChanges(false);
            success("Settings Updated", "Account settings saved successfully");
        } catch (err) {
            console.error("Error updating account settings:", err);
            showError("Settings Update Error", "Failed to save account settings");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setLocalTheme(originalSettings.theme);
        setLocalLanguage(originalSettings.language);
        setLocalTimezone(originalSettings.timezone);
        setHasChanges(false);
    };

    const handleDropdownKeyDown = (e: KeyboardEvent<HTMLDivElement>, setOpen: (open: boolean) => void): void => {
        if (e.key === "Enter" || e.key === " ") setOpen(true);
    };

    const DropdownSelector = ({ 
        label, 
        value, 
        options, 
        isOpen, 
        setIsOpen, 
        onSelect, 
        placeholder 
    }: {
        label: string;
        value: string;
        options: { id: string; label: string; flag?: string; offset?: string }[];
        isOpen: boolean;
        setIsOpen: (open: boolean) => void;
        onSelect: (option: { id: string; label: string; flag?: string; offset?: string }) => void;
        placeholder: string;
    }) => (
        <div className="flex items-center justify-between py-4 border-b border-br-secondary last:border-b-0">
            <div className="flex-1">
                <p className="text-txt-secondary text-sm font-medium mb-1">{label}</p>
                <p className="text-txt-primary text-sm">
                    {options.find(opt => opt.id === value)?.label || placeholder}
                </p>
            </div>
            <div className="relative ml-4">
                <div
                    className="relative cursor-pointer border border-br-secondary pl-3 pr-8 py-2 rounded-md text-txt-primary bg-bg-secondary min-w-[120px]"
                    onClick={() => setIsOpen(!isOpen)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Select ${label.toLowerCase()}`}
                    onKeyDown={(e) => handleDropdownKeyDown(e, setIsOpen)}
                >
                    <span className="text-sm">
                        {options.find(opt => opt.id === value)?.label || placeholder}
                    </span>
                    <svg 
                        className={`absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>

                {isOpen && (
                    <div className="absolute right-0 mt-1 w-64 rounded-md shadow-lg bg-bg-secondary border border-br-secondary z-50 max-h-60 overflow-y-auto">
                        {options.map((option) => (
                            <button
                                key={option.id}
                                className="block w-full text-left px-4 py-2 text-sm text-txt-secondary hover:bg-bg-surface hover:text-txt-primary transition-colors"
                                type="button"
                                onClick={() => onSelect(option)}
                            >
                                <div className="flex items-center">
                                    {option.flag && <span className="mr-2">{option.flag}</span>}
                                    <span>{option.label}</span>
                                    {option.offset && <span className="ml-auto text-xs text-txt-muted">{option.offset}</span>}
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-txt-primary mb-2">Account Settings</h2>
                <p className="text-txt-secondary text-sm">
                    Manage your account preferences and display settings
                </p>
            </div>

            <div className="bg-bg-surface rounded-lg border border-br-secondary overflow-hidden">
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-txt-primary mb-4">Display & Language</h3>
                    
                    <DropdownSelector
                        label="Theme"
                        value={localTheme}
                        options={themes}
                        isOpen={isThemeOpen}
                        setIsOpen={setIsThemeOpen}
                        onSelect={handleThemeSelect}
                        placeholder="Select Theme"
                    />

                    <DropdownSelector
                        label="Language"
                        value={localLanguage}
                        options={languages}
                        isOpen={isLanguageOpen}
                        setIsOpen={setIsLanguageOpen}
                        onSelect={handleLanguageSelect}
                        placeholder="Select Language"
                    />

                    <DropdownSelector
                        label="Timezone"
                        value={localTimezone}
                        options={timezones}
                        isOpen={isTimezoneOpen}
                        setIsOpen={setIsTimezoneOpen}
                        onSelect={handleTimezoneSelect}
                        placeholder="Select Timezone"
                    />
                </div>
            </div>

            {/* Save Buttons */}
            <SaveChanges
                hasChanges={hasChanges}
                loading={loading}
                onSave={handleSave}
                onReset={handleReset}
            />

            {/* Close dropdowns when clicking outside */}
            {(isThemeOpen || isLanguageOpen || isTimezoneOpen) && (
                <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => {
                        setIsThemeOpen(false);
                        setIsLanguageOpen(false);
                        setIsTimezoneOpen(false);
                    }}
                />
            )}
        </div>
    );
};
