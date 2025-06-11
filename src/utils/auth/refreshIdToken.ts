import { auth } from "@/config/firebase";

export const refreshIdToken = async () => {
    const user = auth.currentUser;
    if (!user) throw new Error("No user is currently signed in");
    await user.getIdToken(true);
    const result = await user.getIdTokenResult(true);
    return result.claims;
};
