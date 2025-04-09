import { doc, setDoc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "../config/firebase";

// Add a user as admin
export const addAdmin = async (userId, userEmail) => {
    try {
        const adminRef = doc(db, "admins", userId);
        await setDoc(adminRef, {
            email: userEmail,
            addedAt: new Date(),
            role: "admin"
        });
        return true;
    } catch (error) {
        console.error("Error adding admin:", error);
        throw error;
    }
};

// Check if a user is admin
export const isAdmin = async (userId) => {
    try {
        const adminRef = doc(db, "admins", userId);
        const adminDoc = await getDoc(adminRef);
        return adminDoc.exists();
    } catch (error) {
        console.error("Error checking admin status:", error);
        return false;
    }
};

// Remove admin status
export const removeAdmin = async (userId) => {
    try {
        const adminRef = doc(db, "admins", userId);
        await deleteDoc(adminRef);
        return true;
    } catch (error) {
        console.error("Error removing admin:", error);
        throw error;
    }
}; 