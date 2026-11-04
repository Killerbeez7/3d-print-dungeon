import type { User } from "firebase/auth";

/**
 * The photo of the linked Google account. Firebase refreshes this copy on every Google sign-in,
 * while the account's main photo (and the one saved on the public profile) stay as they were
 * on the first sign-in, so after a while they can point at an old picture that no longer loads.
 */
export const googlePhotoURL = (
  user: Pick<User, "providerData"> | null | undefined,
): string | null =>
  user?.providerData.find((info) => info.providerId === "google.com")?.photoURL || null;

const isGooglePhoto = (url: string) => {
  try {
    return /(^|\.)googleusercontent\.com$/.test(new URL(url).hostname);
  } catch {
    return false;
  }
};

/**
 * The Google photo to save on the profile, or null when nothing should change. A photo the
 * person uploaded here is never replaced; only an empty or older Google photo is.
 */
export const photoToSync = (
  saved: string | null | undefined,
  google: string | null,
): string | null => {
  if (!google || google === saved) return null;
  return !saved || isGooglePhoto(saved) ? google : null;
};
