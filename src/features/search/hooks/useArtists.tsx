import { useQuery } from "@tanstack/react-query";
import {
    getFirestore,
    collection,
    getDocs,
    query,
    orderBy,
    where,
} from "firebase/firestore";
import type { ArtistData } from "@/features/artists/types/artists";

export const useArtists = (search: string) =>
    useQuery({
        enabled: !!search.trim(),
        queryKey: ["artists", search],
        queryFn: async (): Promise<ArtistData[]> => {
            const db = getFirestore();

            // Get all artists and filter client-side for search
            const q = query(
                collection(db, "users"),
                where("isArtist", "==", true),
                orderBy("username")
            );

            const snap = await getDocs(q);
            const allArtists = snap.docs.map((d) => ({
                ...(d.data() as ArtistData),
                uid: d.id,
            }));

            // Filter by search term client-side
            if (search.trim()) {
                const searchLower = search.toLowerCase();
                const filteredArtists = allArtists.filter((artist) => {
                    return (
                        artist.username?.toLowerCase().includes(searchLower) ||
                        artist.displayName?.toLowerCase().includes(searchLower)
                    );
                });
                return filteredArtists;
            }

            return allArtists;
        },
    });
