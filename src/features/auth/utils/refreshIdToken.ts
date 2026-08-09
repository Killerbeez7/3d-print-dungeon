import { auth } from "@/config/firebaseConfig";

export const refreshIdToken = async () => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("No user is currently signed in");
  }

  const tokenResult = await user.getIdTokenResult(true);

  return tokenResult.claims;
};
