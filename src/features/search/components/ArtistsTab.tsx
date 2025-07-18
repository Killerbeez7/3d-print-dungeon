import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    getFirestore,
    collection,
    getDocs,
    query as firestoreQuery,
    orderBy,
    startAt,
    endAt,
    limit,
} from "firebase/firestore";
import type { Artist } from "@/features/search/types/search";
import { Spinner } from "@/features/shared/reusable/Spinner";

interface ArtistsTabProps {
    searchTerm: string;
}

export const ArtistsTab = ({ searchTerm }: ArtistsTabProps) => {
    const [artistResults, setArtistResults] = useState<Artist[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const db = getFirestore();

    useEffect(() => {
        let canceled = false;
        const fetchArtists = async () => {
            setLoading(true);
            try {
                const lowerSearchTerm = searchTerm.toLowerCase();
                const colRef = collection(db, "users");
                const q = firestoreQuery(
                    colRef,
                    orderBy("searchableName"),
                    startAt(lowerSearchTerm),
                    endAt(lowerSearchTerm + "\uf8ff"),
                    limit(50)
                );
                const snap = await getDocs(q);
                const matchedArtists: Artist[] = snap.docs.map((doc) => ({
                    uid: doc.id,
                    ...doc.data(),
                }));
                if (!canceled) {
                    setArtistResults(matchedArtists);
                    setLoading(false);
                }
            } catch (err) {
                console.error("Error fetching artists:", err);
                if (!canceled) {
                    setArtistResults([]);
                    setLoading(false);
                }
            }
        };

        if (searchTerm.trim()) {
            fetchArtists();
        } else {
            setArtistResults([]);
        }
        return () => {
            canceled = true;
        };
    }, [searchTerm, db]);

    return (
        <div className="max-w-xl mx-auto">
            {loading ? (
                <div className="flex justify-center items-center">
                    <Spinner size={24} />
                </div>
            ) : artistResults.length === 0 ? (
                <p className="text-sm text-txt-secondary">
                    {searchTerm.trim()
                        ? "No artists found."
                        : "Start typing to search for artists."}
                </p>
            ) : (
                <div className="flex flex-wrap gap-4">
                    {artistResults.map((a) => (
                        <Link
                            key={a.uid}
                            to={`/artist/${a.uid}`}
                            className="border border-br-primary p-2 rounded hover:shadow-md transition-shadow flex items-center gap-2"
                        >
                            <img
                                src={a.photoURL || "/default-avatar.png"}
                                alt={a.displayName || "Unknown Artist"}
                                className="w-12 h-12 rounded-full object-cover"
                            />
                            <span>{a.displayName}</span>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};
