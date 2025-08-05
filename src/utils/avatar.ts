import { STATIC_ASSETS } from "@/config/assetsConfig";

export const getAvatarUrl = (photoURL?: string | null): string => {
  if (photoURL && photoURL.trim() !== "") return photoURL;
  return STATIC_ASSETS.DEFAULT_AVATAR;
};
