import { doc, getDoc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase";
import { isAdmin } from "./adminService";

const MAINTENANCE_SETTINGS_REF = doc(db, "settings", "maintenance");
const OLD_SETTINGS_REF = doc(db, "settings", "global");

const adjustToGMT3 = (date) => {
    return new Date(date.getTime() + (3 * 60 * 60 * 1000));
};

// Clean up old maintenance settings
export const cleanupOldMaintenanceSettings = async () => {
    try {
        // Check if old settings exist
        const oldSettingsDoc = await getDoc(OLD_SETTINGS_REF);
        if (oldSettingsDoc.exists()) {
            const oldData = oldSettingsDoc.data();
            
            // If old settings had maintenance mode enabled, migrate it
            if (oldData.siteMaintenanceMode) {
                await setDoc(MAINTENANCE_SETTINGS_REF, {
                    isMaintenanceMode: true,
                    maintenanceMessage: oldData.maintenanceMessage || "Site is under maintenance",
                    maintenanceEndTime: null,
                    lastUpdated: serverTimestamp()
                }, { merge: true });
            }

            // Create new settings object without maintenance fields
            const newSettings = { ...oldData };
            delete newSettings.siteMaintenanceMode;
            delete newSettings.maintenanceMessage;
            
            // Update global settings without maintenance fields
            await setDoc(OLD_SETTINGS_REF, newSettings);
        }
    } catch (error) {
        console.error("Error cleaning up old maintenance settings:", error);
    }
};

const checkScheduledMaintenance = (settings) => {
    if (!settings.scheduledMaintenance?.isScheduled) return false;

    const now = new Date();
    const startTime = settings.scheduledMaintenance.startTime?.toDate();
    const endTime = settings.scheduledMaintenance.endTime?.toDate();

    if (!startTime || !endTime) return false;

    const adjustedNow = adjustToGMT3(now);
    const adjustedStart = adjustToGMT3(startTime);
    const adjustedEnd = adjustToGMT3(endTime);

    return adjustedNow >= adjustedStart && adjustedNow <= adjustedEnd;
};

export const checkMaintenanceStatus = async (userId = null) => {
    try {
        const settingsDoc = await getDoc(MAINTENANCE_SETTINGS_REF);
        
        if (!settingsDoc.exists()) {
            return {
                inMaintenance: false,
                message: null,
                endTime: null,
                isAdmin: false
            };
        }

        const settings = settingsDoc.data();
        const adminStatus = userId ? await isAdmin(userId) : false;

        // Check immediate maintenance mode
        if (settings.isMaintenanceMode) {
            return {
                inMaintenance: true,
                message: settings.maintenanceMessage,
                endTime: settings.maintenanceEndTime?.toDate() || null,
                isAdmin: adminStatus
            };
        }

        // Check scheduled maintenance
        const isInScheduledMaintenance = checkScheduledMaintenance(settings);
        if (isInScheduledMaintenance) {
            return {
                inMaintenance: true,
                message: settings.scheduledMaintenance.message,
                endTime: settings.scheduledMaintenance.endTime.toDate(),
                isAdmin: adminStatus
            };
        }

        return {
            inMaintenance: false,
            message: null,
            endTime: null,
            isAdmin: adminStatus
        };
    } catch (error) {
        console.error("Error checking maintenance status:", error);
        return {
            inMaintenance: false,
            message: null,
            endTime: null,
            isAdmin: false
        };
    }
};

export const subscribeToMaintenanceStatus = (callback, userId = null) => {
    return onSnapshot(MAINTENANCE_SETTINGS_REF, async (doc) => {
        if (!doc.exists()) {
            callback({
                inMaintenance: false,
                message: null,
                endTime: null,
                isAdmin: false
            });
            return;
        }

        const settings = doc.data();
        const adminStatus = userId ? await isAdmin(userId) : false;

        // Check immediate maintenance mode
        if (settings.isMaintenanceMode) {
            callback({
                inMaintenance: true,
                message: settings.maintenanceMessage,
                endTime: settings.maintenanceEndTime?.toDate() || null,
                isAdmin: adminStatus
            });
            return;
        }

        // Check scheduled maintenance
        const isInScheduledMaintenance = checkScheduledMaintenance(settings);
        if (isInScheduledMaintenance) {
            callback({
                inMaintenance: true,
                message: settings.scheduledMaintenance.message,
                endTime: settings.scheduledMaintenance.endTime.toDate(),
                isAdmin: adminStatus
            });
            return;
        }

        callback({
            inMaintenance: false,
            message: null,
            endTime: null,
            isAdmin: adminStatus
        });
    });
}; 