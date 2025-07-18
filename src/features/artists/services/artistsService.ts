import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../config/firebaseConfig";
import type { Artist } from "../types/artists";


export const fetchArtists = async (): Promise<Artist[]> => {
    const usersRef = collection(db, "users");
    const artistsQuery = query(usersRef, where("artist", "==", true));
    const querySnapshot = await getDocs(artistsQuery);

    const artistsList: Artist[] = querySnapshot.docs.map((doc) => {
        const data = doc.data() as Artist;
        return {
            ...data,
            id: doc.id,
            uid: data.uid ?? doc.id,
            email: data.email ?? null,
            displayName: data.displayName ?? null,
            photoURL: data.photoURL ?? null,
            bio: data.bio,
        };
    });

    return artistsList;
};
