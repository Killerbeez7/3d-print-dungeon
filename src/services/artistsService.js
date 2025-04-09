import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";

export const getAllArtists = async () => {
    const usersCollectionRef = collection(db, "users");
    try {
        const userDocs = await getDocs(usersCollectionRef);
        const artistsWithUploads = [];

        userDocs.forEach((doc) => {
            const userData = doc.data();
            if (userData.artist) {
                artistsWithUploads.push({
                    id: doc.id,
                    ...userData,
                });
            }
        });

        return artistsWithUploads;
    } catch (error) {
        console.error("Error fetching artists:", error);
        return [];
    }
};
