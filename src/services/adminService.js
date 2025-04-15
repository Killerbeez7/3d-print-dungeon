import { doc, setDoc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "../config/firebase";

// Cache admin status to reduce database reads
const adminCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Add a user as admin
export const addAdmin = async (userId, userEmail) => {
    try {
        const adminRef = doc(db, "admins", userId);
        await setDoc(adminRef, {
            email: userEmail,
            addedAt: new Date(),
            role: "admin"
        });
        // Update cache
        adminCache.set(userId, {
            status: true,
            timestamp: Date.now()
        });
        return true;
    } catch (error) {
        console.error("Error adding admin:", error);
        throw error;
    }
};

// Check if a user is admin
export const isAdmin = async (userId) => {
    if (!userId) return false;

    // Check cache first
    const cached = adminCache.get(userId);
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
        return cached.status;
    }

    try {
        const adminRef = doc(db, "admins", userId);
        const adminDoc = await getDoc(adminRef);
        const isUserAdmin = adminDoc.exists();
        
        // Update cache with timestamp
        adminCache.set(userId, {
            status: isUserAdmin,
            timestamp: Date.now()
        });
        
        return isUserAdmin;
    } catch (error) {
        console.error("Error checking admin status:", error);
        // If there's a cached value, use it even if expired
        if (cached) {
            return cached.status;
        }
        return false;
    }
};

// Remove admin status
export const removeAdmin = async (userId) => {
    try {
        const adminRef = doc(db, "admins", userId);
        await deleteDoc(adminRef);
        // Clear from cache
        adminCache.delete(userId);
        return true;
    } catch (error) {
        console.error("Error removing admin:", error);
        throw error;
    }
};

// Clear admin cache
export const clearAdminCache = () => {
    adminCache.clear();
}; 