import {
    collection,
    query,
    where,
    getDocs,
    doc,
    getDoc,
    limit
} from "firebase/firestore";
import { db } from "@/config/firebaseConfig";
import type { UserProfileValues } from "../profile/types/profile";
// import { httpsCallable } from "firebase/functions";
// import { functions } from "@/config/firebaseConfig";

// Type for public artist data
// export interface ArtistProfileData {
//     username: string;
//     displayName: string;
//     photoURL?: string | null;
//     bio?: string;
//     website?: string;
//     socialLinks?: {
//         twitter?: string;
//         instagram?: string;
//         facebook?: string;
//         youtube?: string;
//     };
//     specialties?: string[];
//     location?: string;
// }


export const getUserById = async (uid: string): Promise<UserProfileValues | null> => {
    try {
        const userDocRef = doc(db, "users", uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            return null;
        }

        const user = userDoc.data() as UserProfileValues;
        return user;
    } catch (error) {
        console.error("Error fetching user by ID:", error);
        throw new Error("Failed to fetch user data");
    }
};


export const getUserByUsername = async (username: string): Promise<UserProfileValues | null> => {
    try {
        const usersRef = collection(db, "users");

        console.log(`🔍 Searching for user with username: "${username}"`);

        const usernameQuery = query(
            usersRef,
            where("username", "==", username),
            limit(1)
        );

        const usernameSnapshot = await getDocs(usernameQuery);

        if (!usernameSnapshot.empty) {
            const doc = usernameSnapshot.docs[0];
            const user = doc.data() as UserProfileValues;
            console.log(`✅ Found user:`, user.displayName);
            return user;
        }

        console.log(`❌ No user found with username: "${username}"`);
        return null;
    } catch (error) {
        console.error("Error fetching user by username:", error);
        throw new Error("Failed to fetch user data");
    }
};

// Artist profile functions
// export const getArtistById = async (artistId: string) => {
//     try {
//         const artistDocRef = doc(db, "artists", artistId);
//         const artistDoc = await getDoc(artistDocRef);

//         if (!artistDoc.exists()) {
//             return null;
//         }

//         return artistDoc.data();
//     } catch (error) {
//         console.error("Error fetching artist by ID:", error);
//         throw new Error("Failed to fetch artist data");
//     }
// };

// export const getArtistByUsername = async (username: string) => {
//     try {
//         const artistsRef = collection(db, "artists");
//         const usernameQuery = query(
//             artistsRef,
//             where("username", "==", username),
//             where("isArtist", "==", true),
//             limit(1)
//         );

//         const usernameSnapshot = await getDocs(usernameQuery);

//         if (!usernameSnapshot.empty) {
//             const doc = usernameSnapshot.docs[0];
//             return doc.data();
//         }

//         return null;
//     } catch (error) {
//         console.error("Error fetching artist by username:", error);
//         throw new Error("Failed to fetch artist data");
//     }
// };

// export const handleUpdateArtistProfile = async (artistData: ArtistProfileData) => {
//     try {
//         const updateArtistProfileCallable = httpsCallable(functions, "updateArtistProfile");
//         const result = await updateArtistProfileCallable({ artistData });
//         return result.data;
//     } catch (error) {
//         console.error("Error updating artist profile:", error);
//         throw new Error("Failed to update artist profile");
//     }
// };