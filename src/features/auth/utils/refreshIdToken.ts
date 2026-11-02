import { auth } from "@/config/firebaseConfig";

/**
 * The signed-in user's claims. `force` asks Google for a fresh token (needed
 * right after a role change); without it the token on this device is used,
 * which needs no network request unless it has expired.
 */
export const refreshIdToken = async (force = true) => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("No user is currently signed in");
  }

  const tokenResult = await user.getIdTokenResult(force);

  return tokenResult.claims;
};
