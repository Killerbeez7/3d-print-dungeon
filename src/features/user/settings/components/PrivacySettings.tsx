import { useState, useEffect } from "react";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { useSystemAlert } from "@/features/system-alerts";

import { DEFAULT_USER_SETTINGS, settingsService } from "../services/settingsService";

import type {
  MessagePermission,
  PrivacyPreferences,
  ProfileVisibility,
} from "../types/settings";

import { SaveChanges } from "./parts/SaveChanges";

interface ToggleSwitchProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label: string;
  description: string;
}

interface DropdownOption<T extends string> {
  id: T;
  label: string;
  description?: string;
}

interface DropdownSelectorProps<T extends string> {
  label: string;
  value: T;
  options: DropdownOption<T>[];
  onChange: (value: T) => void;
  description: string;
  disabled?: boolean;
}

const PROFILE_VISIBILITY_OPTIONS: DropdownOption<ProfileVisibility>[] = [
  {
    id: "public",
    label: "Public",
    description: "Anyone can see your profile",
  },
  {
    id: "friends",
    label: "Friends Only",
    description: "Only your friends can see your profile",
  },
  {
    id: "private",
    label: "Private",
    description: "Only you can see your profile",
  },
];

const MESSAGE_PERMISSION_OPTIONS: DropdownOption<MessagePermission>[] = [
  {
    id: "everyone",
    label: "Everyone",
    description: "Anyone can send you messages",
  },
  {
    id: "followers",
    label: "Followers Only",
    description: "Only your followers can message you",
  },
  {
    id: "none",
    label: "No One",
    description: "No one can send you messages",
  },
];

const ToggleSwitch = ({ enabled, onChange, label, description }: ToggleSwitchProps) => (
  <div className="flex items-center justify-between py-4 border-b border-br-secondary last:border-b-0">
    <div className="flex-1">
      <p className="text-txt-primary text-sm font-medium">{label}</p>

      <p className="text-txt-secondary text-xs mt-1">{description}</p>
    </div>

    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 ${
        enabled ? "bg-accent" : "bg-br-secondary"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  </div>
);

const DropdownSelector = <T extends string>({
  label,
  value,
  options,
  onChange,
  description,
  disabled = false,
}: DropdownSelectorProps<T>) => (
  <div className="flex items-center justify-between py-4 border-b border-br-secondary last:border-b-0">
    <div className="flex-1">
      <p className="text-txt-primary text-sm font-medium">{label}</p>

      <p className="text-txt-secondary text-xs mt-1">{description}</p>
    </div>

    <select
      value={value}
      onChange={(event) => onChange(event.target.value as T)}
      disabled={disabled}
      className="ml-4 px-3 py-1 border border-br-secondary rounded-md bg-section text-txt-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent min-w-[140px]"
    >
      {options.map((option) => (
        <option key={option.id} value={option.id}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

export const PrivacySettings = () => {
  const { currentUser } = useAuth();

  const { success, error: showError } = useSystemAlert();

  const [loading, setLoading] = useState(false);

  const [privacy, setPrivacy] = useState<PrivacyPreferences>({
    ...DEFAULT_USER_SETTINGS.privacy,
  });

  const [originalPrivacy, setOriginalPrivacy] = useState<PrivacyPreferences>({
    ...DEFAULT_USER_SETTINGS.privacy,
  });

  const hasChanges =
    privacy.profileVisibility !== originalPrivacy.profileVisibility ||
    privacy.showEmail !== originalPrivacy.showEmail ||
    privacy.showLocation !== originalPrivacy.showLocation ||
    privacy.showLastActive !== originalPrivacy.showLastActive ||
    privacy.allowMessages !== originalPrivacy.allowMessages;

  useEffect(() => {
    const loadPrivacySettings = async () => {
      if (!currentUser?.uid) {
        return;
      }

      try {
        const userSettings = await settingsService.getUserSettings(currentUser.uid);

        setPrivacy({
          ...userSettings.privacy,
        });

        setOriginalPrivacy({
          ...userSettings.privacy,
        });
      } catch (error) {
        console.error("Error loading privacy settings:", error);

        showError("Settings Load Error", "Failed to load privacy settings");
      }
    };

    loadPrivacySettings();
  }, [currentUser, showError]);

  const updatePrivacySetting = <K extends keyof PrivacyPreferences>(
    setting: K,
    value: PrivacyPreferences[K]
  ) => {
    setPrivacy((previous) => ({
      ...previous,
      [setting]: value,
    }));
  };

  const handleSave = async () => {
    if (!currentUser?.uid || !hasChanges) {
      return;
    }

    setLoading(true);

    try {
      await settingsService.updateUserSettings(currentUser.uid, {
        privacy,
      });

      setOriginalPrivacy({
        ...privacy,
      });

      success("Privacy Updated", "Privacy settings saved successfully");
    } catch (error) {
      console.error("Error updating privacy settings:", error);

      showError("Privacy Update Error", "Failed to save privacy settings");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPrivacy({
      ...originalPrivacy,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-txt-primary mb-2">Privacy Settings</h2>

        <p className="text-txt-secondary text-sm">
          Control who can see your profile and contact you
        </p>
      </div>

      {/* Profile Visibility */}
      <div className="bg-surface-card rounded-lg border border-br-secondary overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-txt-primary mb-4">
            Profile Visibility
          </h3>

          <DropdownSelector
            label="Profile Visibility"
            value={privacy.profileVisibility}
            options={PROFILE_VISIBILITY_OPTIONS}
            onChange={(value) => updatePrivacySetting("profileVisibility", value)}
            description="Control who can see your profile information"
            disabled={loading}
          />

          <DropdownSelector
            label="Who Can Message You"
            value={privacy.allowMessages}
            options={MESSAGE_PERMISSION_OPTIONS}
            onChange={(value) => updatePrivacySetting("allowMessages", value)}
            description="Control who can send you direct messages"
            disabled={loading}
          />
        </div>
      </div>

      {/* Information Sharing */}
      <div className="bg-surface-card rounded-lg border border-br-secondary overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-txt-primary mb-4">
            Information Sharing
          </h3>

          <ToggleSwitch
            enabled={privacy.showEmail}
            onChange={(enabled) => updatePrivacySetting("showEmail", enabled)}
            label="Show Email Address"
            description="Display your email address on your public profile"
          />

          <ToggleSwitch
            enabled={privacy.showLocation}
            onChange={(enabled) => updatePrivacySetting("showLocation", enabled)}
            label="Show Location"
            description="Display your location on your public profile"
          />

          <ToggleSwitch
            enabled={privacy.showLastActive}
            onChange={(enabled) => updatePrivacySetting("showLastActive", enabled)}
            label="Show Last Active"
            description="Display when you were last active on the platform"
          />
        </div>
      </div>

      {/* Privacy Information */}
      <div className="bg-section rounded-lg border border-br-secondary p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-txt-secondary"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          <div className="ml-3">
            <h3 className="text-sm font-medium text-txt-primary">Privacy & Security</h3>

            <div className="mt-2 text-sm text-txt-secondary">
              <p>
                Your privacy is important to us. These settings help you control what
                information is visible to others. You can change these settings at any
                time.
              </p>
            </div>
          </div>
        </div>
      </div>

      <SaveChanges
        hasChanges={hasChanges}
        loading={loading}
        onSave={handleSave}
        onReset={handleReset}
      />
    </div>
  );
};
