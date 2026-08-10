import { getDownloadURL, uploadBytes, ref } from "firebase/storage";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { updateProfile as updateFirebaseProfile, type User } from "firebase/auth";

import { db, storage } from "@/config/firebaseConfig";

import { getPublicProfileById } from "@/features/user/profile/services/profileService";

import type {
  PublicProfile,
  PublicProfileView,
} from "@/features/user/profile/types/profile";

import type { ProfileSettingsData } from "../types/settings";

type ProfileImageType = "profile" | "cover";

interface ProfileUpdateResult {
  photoURL: string | null;
  coverURL: string | null;
}

const normalizeOptionalText = (value?: string): string | null => {
  const normalized = value?.trim();

  return normalized || null;
};

const buildLocation = (city: string, country: string): string | null => {
  const normalizedCity = city.trim();
  const normalizedCountry = country.trim();

  const parts = [normalizedCity, normalizedCountry].filter(Boolean);

  return parts.length > 0 ? parts.join(", ") : null;
};

export const profileService = {
  async uploadImage(file: File, userId: string, type: ProfileImageType): Promise<string> {
    const imageRef = ref(storage, `users/${userId}/${type}`);

    const snapshot = await uploadBytes(imageRef, file, {
      contentType: file.type,
      cacheControl: "public,max-age=31536000,immutable",
    });

    return getDownloadURL(snapshot.ref);
  },

  async updateProfile(
    user: User,
    profileData: ProfileSettingsData,
    profilePicture: File | null = null,
    coverPhoto: File | null = null
  ): Promise<ProfileUpdateResult> {
    const displayName = profileData.displayName.trim();

    if (!displayName) {
      throw new Error("Display name is required.");
    }

    let photoURL = user.photoURL;
    let coverURL: string | null = null;

    if (profilePicture) {
      photoURL = await this.uploadImage(profilePicture, user.uid, "profile");
    }

    if (coverPhoto) {
      coverURL = await this.uploadImage(coverPhoto, user.uid, "cover");
    }

    await updateFirebaseProfile(user, {
      displayName,
      photoURL,
    });

    const socialLinks: NonNullable<PublicProfile["socialLinks"]> = {
      facebook: normalizeOptionalText(profileData.socials.facebook),
      twitter: normalizeOptionalText(profileData.socials.twitter),
      instagram: normalizeOptionalText(profileData.socials.instagram),
    };

    const publicProfileRef = doc(db, "users", user.uid, "public", "data");

    await updateDoc(publicProfileRef, {
      displayName,
      bio: normalizeOptionalText(profileData.bio),
      location: buildLocation(profileData.city, profileData.country),
      socialLinks,
      photoURL: photoURL ?? null,
      lastActiveAt: serverTimestamp(),
    });

    return {
      photoURL,
      coverURL,
    };
  },

  async getProfileData(userId: string): Promise<{
    publicData: PublicProfileView | null;
  }> {
    const publicData = await getPublicProfileById(userId);

    return {
      publicData,
    };
  },
};
