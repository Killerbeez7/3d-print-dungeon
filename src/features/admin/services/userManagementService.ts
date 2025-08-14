import { db } from "@/config/firebaseConfig";
import {
    collection,
    query,
    getDocs,
    doc,
    getDoc,
} from "firebase/firestore";
import type { PublicProfileView, PrivateProfile } from "@/features/user/types/user";

export interface AdminUserRow {
    id: string;
    uid: string;
    email: string | null;
    displayName: string;
    username: string;
    photoURL?: string;
    roles?: string[];
    accountStatus: string;
    createdAt?: Date;
    lastLoginAt?: Date;
    isArtist?: boolean;
}

// Fetch all users for admin management using the new schema
export async function fetchAllUsersForAdmin(): Promise<AdminUserRow[]> {
    try {
        // Get all user documents
        const usersQuery = query(collection(db, "users"));
        const usersSnap = await getDocs(usersQuery);
        const userUids = usersSnap.docs.map(doc => doc.id);

        const adminUsers: AdminUserRow[] = [];

        // Process in batches to avoid too many concurrent requests
        const batchSize = 10;
        for (let i = 0; i < userUids.length; i += batchSize) {
            const batch = userUids.slice(i, i + batchSize);
            const batchPromises = batch.map(async (uid) => {
                try {
                    // Get both public and private profiles
                    const [publicRef, privateRef] = [
                        doc(db, `users/${uid}/public/data`),
                        doc(db, `users/${uid}/private/data`)
                    ];

                    const [publicSnap, privateSnap] = await Promise.all([
                        getDoc(publicRef),
                        getDoc(privateRef)
                    ]);

                    if (publicSnap.exists() && privateSnap.exists()) {
                        const publicData = publicSnap.data() as PublicProfileView;
                        const privateData = privateSnap.data() as PrivateProfile;

                        return {
                            id: uid,
                            uid: uid,
                            email: privateData.email,
                            displayName: publicData.displayName,
                            username: publicData.username,
                            photoURL: publicData.photoURL,
                            roles: privateData.roles || [],
                            accountStatus: privateData.accountStatus || 'active',
                            createdAt: privateData.createdAt instanceof Date ? privateData.createdAt : undefined,
                            lastLoginAt: privateData.lastLoginAt instanceof Date ? privateData.lastLoginAt : undefined,
                            isArtist: publicData.isArtist || false,
                        } as AdminUserRow;
                    }
                    return null;
                } catch (error) {
                    console.error(`Error fetching user data for ${uid}:`, error);
                    return null;
                }
            });

            const batchResults = await Promise.all(batchPromises);
            adminUsers.push(...batchResults.filter(Boolean) as AdminUserRow[]);
        }

        return adminUsers;
    } catch (error) {
        console.error("Error fetching users for admin:", error);
        throw error;
    }
}

// Search users for admin management
export async function searchUsersForAdmin(searchTerm: string): Promise<AdminUserRow[]> {
    try {
        const allUsers = await fetchAllUsersForAdmin();
        
        if (!searchTerm.trim()) {
            return allUsers;
        }

        const searchLower = searchTerm.toLowerCase();
        return allUsers.filter(user => 
            user.username?.toLowerCase().includes(searchLower) ||
            user.displayName?.toLowerCase().includes(searchLower) ||
            user.email?.toLowerCase().includes(searchLower) ||
            user.uid.toLowerCase().includes(searchLower)
        );
    } catch (error) {
        console.error("Error searching users for admin:", error);
        throw error;
    }
}
