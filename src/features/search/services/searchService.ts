import { db } from "@/config/firebaseConfig";
import {
    collection,
    query,
    limit,
    getDocs,
    getDoc,
    doc,
} from "firebase/firestore";
import type { ArtistData } from "@/features/artists/types/artists";
import type { PublicProfileView } from "@/features/user/types/user";

// Search for artists using the new user schema
export async function searchArtists(searchTerm: string, limitCount: number = 5): Promise<ArtistData[]> {
    try {
        if (!searchTerm.trim()) {
            return [];
        }

        // Get all users first, then filter by isArtist in public profile
        const usersQuery = query(
            collection(db, "users"),
            limit(100) // Get more to filter from
        );

        const usersSnap = await getDocs(usersQuery);
        const userUids = usersSnap.docs.map(doc => doc.id);

        if (userUids.length === 0) {
            return [];
        }

        // Fetch public profiles for all users and filter for artists
        const publicProfiles: PublicProfileView[] = [];
        
        // Process in batches to avoid too many concurrent requests
        const batchSize = 10;
        for (let i = 0; i < userUids.length; i += batchSize) {
            const batch = userUids.slice(i, i + batchSize);
            const batchPromises = batch.map(async (uid) => {
                try {
                    const publicRef = doc(db, `users/${uid}/public/data`);
                    const publicSnap = await getDoc(publicRef);
                    if (publicSnap.exists()) {
                        const data = publicSnap.data() as PublicProfileView;
                        // Only include users who are artists
                        if (data.isArtist) {
                            return { ...data, uid };
                        }
                    }
                    return null;
                } catch (error) {
                    console.error(`Error fetching public profile for ${uid}:`, error);
                    return null;
                }
            });

            const batchResults = await Promise.all(batchPromises);
            publicProfiles.push(...batchResults.filter(Boolean) as PublicProfileView[]);
        }

        // Filter by search term
        const searchLower = searchTerm.toLowerCase();
        console.log("Search service - Searching for:", searchLower);
        console.log("Search service - Available artists:", publicProfiles.map(a => ({ username: a.username, displayName: a.displayName })));
        
        const filteredArtists = publicProfiles.filter((artist) => {
            const matches = (
                artist.username?.toLowerCase().includes(searchLower) ||
                artist.displayName?.toLowerCase().includes(searchLower) ||
                artist.bio?.toLowerCase().includes(searchLower)
            );
            if (matches) {
                console.log("Search service - Match found:", artist.username, artist.displayName);
            }
            return matches;
        });

        console.log("Search service - Total artists found:", publicProfiles.length);
        console.log("Search service - Filtered artists:", filteredArtists.length);

        // Convert to ArtistData format and limit results
        const artistResults: ArtistData[] = filteredArtists.slice(0, limitCount).map(artist => ({
            ...artist,
            bio: artist.bio,
            displayName: artist.displayName,
            photoURL: artist.photoURL,
            username: artist.username,
        }));

        console.log("Search service - Final results:", artistResults.length);
        return artistResults;
    } catch (error) {
        console.error("Error searching artists:", error);
        return [];
    }
}

// Get all artists for pagination (used in artists list page)
export async function fetchArtistsForSearch(
    searchTerm?: string,
    limitCount: number = 32
): Promise<ArtistData[]> {
    try {
        // Get all users first, then filter by isArtist in public profile
        const usersQuery = query(
            collection(db, "users"),
            limit(200) // Get more to filter from
        );

        const usersSnap = await getDocs(usersQuery);
        const userUids = usersSnap.docs.map(doc => doc.id);

        if (userUids.length === 0) {
            return [];
        }

        // Fetch public profiles for all users and filter for artists
        const publicProfiles: PublicProfileView[] = [];
        
        // Process in batches
        const batchSize = 10;
        for (let i = 0; i < userUids.length; i += batchSize) {
            const batch = userUids.slice(i, i + batchSize);
            const batchPromises = batch.map(async (uid) => {
                try {
                    const publicRef = doc(db, `users/${uid}/public/data`);
                    const publicSnap = await getDoc(publicRef);
                    if (publicSnap.exists()) {
                        const data = publicSnap.data() as PublicProfileView;
                        // Only include users who are artists
                        if (data.isArtist) {
                            return { ...data, uid };
                        }
                    }
                    return null;
                } catch (error) {
                    console.error(`Error fetching public profile for ${uid}:`, error);
                    return null;
                }
            });

            const batchResults = await Promise.all(batchPromises);
            publicProfiles.push(...batchResults.filter(Boolean) as PublicProfileView[]);
        }

        // Filter by search term if provided
        let filteredArtists = publicProfiles;
        if (searchTerm?.trim()) {
            const searchLower = searchTerm.toLowerCase();
            filteredArtists = publicProfiles.filter((artist) => {
                return (
                    artist.username?.toLowerCase().includes(searchLower) ||
                    artist.displayName?.toLowerCase().includes(searchLower) ||
                    artist.bio?.toLowerCase().includes(searchLower)
                );
            });
        }

        // Convert to ArtistData format and limit results
        const artistResults: ArtistData[] = filteredArtists.slice(0, limitCount).map(artist => ({
            ...artist,
            bio: artist.bio,
            displayName: artist.displayName,
            photoURL: artist.photoURL,
            username: artist.username,
        }));

        return artistResults;
    } catch (error) {
        console.error("Error fetching artists for search:", error);
        return [];
    }
}
