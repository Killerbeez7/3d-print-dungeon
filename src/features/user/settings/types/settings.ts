export type ThemePreference = "light" | "dark" | "auto";

export type ProfileVisibility = "public" | "private" | "friends";

export type MessagePermission = "everyone" | "followers" | "none";

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  marketing: boolean;
  newFollowers: boolean;
  newLikes: boolean;
  newComments: boolean;
  modelUpdates: boolean;
}

export interface PrivacyPreferences {
  profileVisibility: ProfileVisibility;
  showEmail: boolean;
  showLocation: boolean;
  showLastActive: boolean;
  allowMessages: MessagePermission;
}

export interface SecurityPreferences {
  twoFactorEnabled: boolean;
  sessionTimeout: number;
  loginNotifications: boolean;
}

export interface UserSettings {
  language: string;
  timezone: string;
  notifications: NotificationPreferences;
  privacy: PrivacyPreferences;
  security: SecurityPreferences;
  theme: ThemePreference;
}

export interface SocialAccounts {
  facebook?: string;
  twitter?: string;
  instagram?: string;
}

export interface ProfileSettingsData {
  displayName: string;
  city: string;
  country: string;
  bio: string;
  socials: SocialAccounts;
}
