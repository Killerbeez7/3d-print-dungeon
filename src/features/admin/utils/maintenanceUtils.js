import { doc, getDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import { isAdmin } from "../../features/admin/services/adminService";

export const checkMaintenanceMode = async (uid) => {
    try {
        // Check maintenance mode from settings
        const settingsRef = doc(db, "settings", "global");
        const settingsDoc = await getDoc(settingsRef);
        
        if (!settingsDoc.exists()) {
            return { isMaintenance: false, isAdmin: false };
        }

        const maintenanceMode = settingsDoc.data().siteMaintenanceMode || false;
        
        // If maintenance mode is off, no need to check admin status
        if (!maintenanceMode) {
            return { isMaintenance: false, isAdmin: false };
        }

        // If maintenance mode is on, check if user is admin
        const adminStatus = uid ? await isAdmin(uid) : false;
        
        return {
            isMaintenance: maintenanceMode,
            isAdmin: adminStatus
        };
    } catch (error) {
        console.error("Error checking maintenance mode:", error);
        // In case of error, assume maintenance mode is off
        return { isMaintenance: false, isAdmin: false };
    }
}; 