import { collection, getDocs, DocumentData } from "firebase/firestore";
import { db } from "../config/firebase";

// Define Artist type, extending RawUserData with 'artist' boolean and optional uploads
export interface Artist {
    id: string;
    artist: boolean;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    roles?: string[];
    username?: string;
    createdAt?: Date | string | number;
    lastLogin?: Date | string | number;
    // Add other fields as needed
    [key: string]: unknown;
}


export const getAllArtists = async (): Promise<Artist[]> => {
    const usersCollectionRef = collection(db, "users");
    try {
        const userDocs = await getDocs(usersCollectionRef);
        const artistsWithUploads: Artist[] = [];

        userDocs.forEach((doc) => {
            const userData = doc.data() as DocumentData;
            artistsWithUploads.push({
                id: doc.id,
                artist: userData.artist === true,
                email: userData.email ?? null,
                displayName: userData.displayName ?? null,
                photoURL: userData.photoURL ?? null,
                roles: userData.roles,
                username: userData.username,
                createdAt: userData.createdAt,
                lastLogin: userData.lastLogin,
                ...userData, // keep this last to allow extra fields, but required fields above take precedence
            });
        });

        return artistsWithUploads;
    } catch (error) {
        console.error("Error fetching artists:", error);
        return [];
    }
};
