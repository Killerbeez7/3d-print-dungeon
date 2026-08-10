import { doc, getDoc, setDoc } from "firebase/firestore";

import { db } from "@/config/firebaseConfig";

import type { UserSettings } from "../types/settings";

type StoredUserSettings = Partial<
  Omit<UserSettings, "notifications" | "privacy" | "security">
> & {
  notifications?: Partial<UserSettings["notifications"]>;
  privacy?: Partial<UserSettings["privacy"]>;
  security?: Partial<UserSettings["security"]>;
};

export const DEFAULT_USER_SETTINGS: UserSettings = {
  language: "en",
  timezone: "UTC",
  theme: "dark",

  notifications: {
    email: true,
    push: true,
    marketing: false,
    newFollowers: true,
    newLikes: true,
    newComments: true,
    modelUpdates: true,
  },

  privacy: {
    profileVisibility: "public",
    showEmail: false,
    showLocation: true,
    showLastActive: true,
    allowMessages: "everyone",
  },

  security: {
    twoFactorEnabled: false,
    sessionTimeout: 60,
    loginNotifications: true,
  },
};

function normalizeUserSettings(settings?: StoredUserSettings): UserSettings {
  return {
    language: settings?.language ?? DEFAULT_USER_SETTINGS.language,

    timezone: settings?.timezone ?? DEFAULT_USER_SETTINGS.timezone,

    theme: settings?.theme ?? DEFAULT_USER_SETTINGS.theme,

    notifications: {
      ...DEFAULT_USER_SETTINGS.notifications,
      ...settings?.notifications,
    },

    privacy: {
      ...DEFAULT_USER_SETTINGS.privacy,
      ...settings?.privacy,
    },

    security: {
      ...DEFAULT_USER_SETTINGS.security,
      ...settings?.security,
    },
  };
}

export const settingsService = {
  async getUserSettings(userId: string): Promise<UserSettings> {
    const settingsRef = doc(db, "users", userId, "settings", "app");

    const snapshot = await getDoc(settingsRef);

    if (!snapshot.exists()) {
      return normalizeUserSettings();
    }

    return normalizeUserSettings(snapshot.data() as StoredUserSettings);
  },

  async updateUserSettings(
    userId: string,
    settings: Partial<UserSettings>
  ): Promise<void> {
    const settingsRef = doc(db, "users", userId, "settings", "app");

    await setDoc(settingsRef, settings, {
      merge: true,
    });
  },
};
