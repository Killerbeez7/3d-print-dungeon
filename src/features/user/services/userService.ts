/**
 * @file userService.ts
 * @description User service for fetching user data
 * @usedIn UserProfilePage, useProfile
 */

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