import { storage } from "@/config/firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updateProfile, User } from "firebase/auth";
import { doc, updateDoc, getDoc, getFirestore, Timestamp, serverTimestamp } from "firebase/firestore";
import type { PublicProfile } from "@/features/user/types/user";

const db = getFirestore();

interface SocialAccounts {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
}

interface ProfileData {
    displayName: string;
    email: string;
    isEmailPublic: boolean;
    city: string;
    country: string;
    bio: string;
    socials: SocialAccounts;
}

// Use the main PublicProfile interface instead of duplicating
type PublicUserData = PublicProfile;

export const profileService = {

    async uploadImage(file: File, userId: string, type: 'profile' | 'cover'): Promise<string> {
        const imageRef = ref(storage, `users/${userId}/${type}`);
        const snapshot = await uploadBytes(imageRef, file, {
            contentType: file.type,
            cacheControl: "public,max-age=31536000,immutable"
        });
        return await getDownloadURL(snapshot.ref);
    },

    async updateProfile(
        user: User,
        profileData: ProfileData,
        profilePicture: File | null = null,
        coverPhoto: File | null = null
    ): Promise<{ photoURL: string | null; coverURL: string | null }> {
        try {
            let photoURL: string | null = user.photoURL;
            let coverURL: string | null = null;

            // Upload new images if provided
            if (profilePicture) {
                photoURL = await this.uploadImage(profilePicture, user.uid, 'profile');
            }

            if (coverPhoto) {
                coverURL = await this.uploadImage(coverPhoto, user.uid, 'cover');
            }

            // Update Firebase Auth profile
            await updateProfile(user, {
                displayName: profileData.displayName,
                photoURL: photoURL || undefined,
            });

            // Update Firestore public data document (avoid undefined fields)
            const computedLocation = profileData.city && profileData.country
                ? `${profileData.city}, ${profileData.country}`
                : (profileData.city || profileData.country || undefined);

            // Normalize optional fields: always string or null (never undefined)
            const normalizedFacebook = profileData.socials.facebook?.trim() || null;
            const normalizedTwitter = profileData.socials.twitter?.trim() || null;
            const normalizedInstagram = profileData.socials.instagram?.trim() || null;
            const normalizedLinkedin = profileData.socials.linkedin?.trim() || null;

            const socialLinks: NonNullable<PublicUserData["socialLinks"]> = {
                facebook: normalizedFacebook,
                twitter: normalizedTwitter,
                instagram: normalizedInstagram,
                linkedin: normalizedLinkedin,
            };

            const publicData: Partial<PublicUserData> & { lastActiveAt: Timestamp } = {
                displayName: profileData.displayName,
                bio: profileData.bio?.trim() || null,
                lastActiveAt: serverTimestamp() as Timestamp,
            };
            // Always include keys as string|null
            publicData.location = (computedLocation && computedLocation.trim() !== "") ? computedLocation : null;
            publicData.socialLinks = socialLinks;
            publicData.photoURL = photoURL ?? null;

            await updateDoc(doc(db, "users", user.uid, "public", "data"), publicData);

            return { photoURL, coverURL };
        } catch (error) {
            console.error("Error updating profile:", error);
            throw error;
        }
    },

    async getProfileData(userId: string): Promise<{
        publicData: PublicUserData | null;
    }> {
        try {
            const publicDoc = await getDoc(doc(db, "users", userId, "public", "data"));
            
            const publicData = publicDoc.exists() ? publicDoc.data() as PublicUserData : null;

            return { publicData };
        } catch (error) {
            console.error("Error fetching profile data:", error);
            throw error;
        }
    }
}; 