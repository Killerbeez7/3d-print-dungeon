import { httpsCallable } from "firebase/functions";
import { functions } from "@/config/firebaseConfig";

// check username availability
export const isUsernameAvailableInDB = async (username: string): Promise<boolean> => {
    try {
        const checkUsernameAvailability = httpsCallable(functions, "checkUsernameAvailability");
        const result = await checkUsernameAvailability({ username });
        const data = result.data as { available: boolean; username: string };
        return data.available;
    } catch (error) {
        console.error("Error checking username availability:", error);
        throw new Error("Failed to check username availability");
    }
};

// check email availability
export const isEmailAvailableInDB = async (email: string): Promise<{ available: boolean; error?: string }> => {
    try {
        const checkEmailAvailability = httpsCallable(functions, "checkEmailAvailability");
        const result = await checkEmailAvailability({ email });
        const data = result.data as { available: boolean; error?: string };
        return data;
    } catch (error) {
        console.error("Error checking email availability:", error);
        return { available: false, error: "Failed to check email availability" };
    }
};