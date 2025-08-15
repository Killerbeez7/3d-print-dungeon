import { doc, getDoc, setDoc, getFirestore } from "firebase/firestore";

const db = getFirestore();

export interface UserAppSettings {
    language: string;
    timezone: string;
    notifications: {
        email: boolean;
        push: boolean;
        marketing: boolean;
        newFollowers: boolean;
        newLikes: boolean;
        newComments: boolean;
        modelUpdates: boolean;
    };
    privacy: {
        profileVisibility: "public" | "private" | "friends";
        showEmail: boolean;
        showLocation: boolean;
        showLastActive: boolean;
        allowMessages: "everyone" | "followers" | "none";
    };
    security: {
        twoFactorEnabled: boolean;
        sessionTimeout: number; // minutes
        loginNotifications: boolean;
    };
    theme?: "light" | "dark" | "auto";
}

export const settingsService = {
    async getUserSettings(userId: string): Promise<UserAppSettings | null> {
        try {
            const settingsDoc = await getDoc(doc(db, "users", userId, "settings", "app"));
            
            if (!settingsDoc.exists()) {
                return null;
            }
            
            return settingsDoc.data() as UserAppSettings;
        } catch (error) {
            console.error("Error fetching user settings:", error);
            throw error;
        }
    },

    async updateUserSettings(userId: string, settings: Partial<UserAppSettings>): Promise<void> {
        try {
            await setDoc(
                doc(db, "users", userId, "settings", "app"), 
                { ...settings },
                { merge: true }
            );
        } catch (error) {
            console.error("Error updating user settings:", error);
            throw error;
        }
    },

    async getDefaultSettings(): Promise<UserAppSettings> {
        return {
            language: "en",
            timezone: "UTC",
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
            theme: "auto",
        };
    }
};

