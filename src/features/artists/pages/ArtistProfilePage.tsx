import { useParams, Navigate } from "react-router-dom";
import { ArtistProfile } from "@/features/artists/components/ArtistProfile";

export function ArtistProfilePage() {
    const { artistId } = useParams<{ artistId?: string }>();

    if (!artistId) {
        return <Navigate to="/artists" replace />;
    }

    return <ArtistProfile artistId={artistId} />;
}