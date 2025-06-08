import { auth } from "@/config/firebase";

// Force-refresh the current user's ID-token so custom-claims are re-loaded
export const refreshIdToken = async () => {
    const user = auth.currentUser;
    if (!user) {
        throw new Error("No user is currently signed in");
    }

    // Force token refresh
    await user.getIdToken(true);
    
    // Get and verify the new token
    const result = await user.getIdTokenResult(true);
    console.debug("Refreshed token claims:", result.claims);
    
    return result.claims;
};
