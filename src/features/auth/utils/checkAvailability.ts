import { httpsCallable } from "firebase/functions";
import { functions } from "@/config/firebaseConfig";

type UsernameAvailabilityResponse = {
  available: boolean;
  username: string;
};

type EmailAvailabilityResponse = {
  available: boolean;
  error?: string;
};

const checkUsernameAvailability = httpsCallable<
  { username: string },
  UsernameAvailabilityResponse
>(functions, "checkUsernameAvailability");

const checkEmailAvailability = httpsCallable<
  { email: string },
  EmailAvailabilityResponse
>(functions, "checkEmailAvailability");

export const isUsernameAvailableInDB = async (username: string): Promise<boolean> => {
  try {
    const result = await checkUsernameAvailability({
      username,
    });

    return result.data.available;
  } catch (error) {
    console.error("Failed to check username availability:", error);

    throw error;
  }
};

export const isEmailAvailableInDB = async (
  email: string
): Promise<EmailAvailabilityResponse> => {
  try {
    const result = await checkEmailAvailability({
      email,
    });

    return result.data;
  } catch (error) {
    console.error("Failed to check email availability:", error);

    throw error;
  }
};
