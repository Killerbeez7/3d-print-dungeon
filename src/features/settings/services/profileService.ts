import { storage } from "../../../config/firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updateProfile, User } from "firebase/auth";
import { doc, updateDoc, getDoc, getFirestore } from "firebase/firestore";

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

interface UserProfile extends ProfileData {
    photoURL?: string;
    coverURL?: string;
    updatedAt: string;
}

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

            // Update Firestore user document
            const userData: Partial<UserProfile> = {
                displayName: profileData.displayName,
                email: profileData.email,
                isEmailPublic: profileData.isEmailPublic,
                city: profileData.city,
                country: profileData.country,
                bio: profileData.bio,
                socials: profileData.socials,
                updatedAt: new Date().toISOString(),
            };

            // Only include URLs if they exist
            if (photoURL) {
                userData.photoURL = photoURL;
            }
            if (coverURL) {
                userData.coverURL = coverURL;
            }

            await updateDoc(doc(db, "users", user.uid), userData);

            return { photoURL, coverURL };
        } catch (error) {
            console.error("Error updating profile:", error);
            throw error;
        }
    },


    async getProfileData(userId: string): Promise<UserProfile | null> {
        try {
            const userDocRef = doc(db, "users", userId);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) {
                return null;
            }

            return userDoc.data() as UserProfile;
        } catch (error) {
            console.error("Error fetching profile data:", error);
            throw error;
        }
    }
}; 