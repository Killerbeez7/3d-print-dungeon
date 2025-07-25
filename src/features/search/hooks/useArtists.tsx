import { useQuery } from "@tanstack/react-query";
import {
    getFirestore,
    collection,
    getDocs,
    query,
    orderBy,
    startAt,
    endAt,
    limit,
} from "firebase/firestore";
import type { ArtistData } from "@/features/artists/types/artists";

export const useArtists = (search: string) =>
    useQuery({
        enabled: !!search.trim(),
        queryKey: ["artists", search],
        queryFn: async (): Promise<ArtistData[]> => {
            const db = getFirestore();

            // Use searchableName for efficient prefix search
            const q = query(
                collection(db, "users"),
                orderBy("searchableName"),
                startAt(search.toLowerCase()),
                endAt(search.toLowerCase() + "\uf8ff"),
                limit(50)
            );

            const snap = await getDocs(q);
            return snap.docs.map((d) => ({
                ...(d.data() as ArtistData),
                uid: d.id,
            }));
        },
    });
