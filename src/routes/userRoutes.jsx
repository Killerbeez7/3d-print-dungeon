import { ProfileSettings } from "../components/settings/ProfileSettings";
import { ArtistProfile } from "../components/artists/artist-profile/ArtistProfile";
import { ArtistsList } from "../components/artists/ArtistsList";
import { ProtectedRoute } from "../components/shared/ProtectedRoute";

export const userRoutes = [
    {
        path: "/settings",
        element: <ProtectedRoute><ProfileSettings /></ProtectedRoute>
    },
    {
        path: "/artists",
        element: <ArtistsList />
    },
    {
        path: "/artist/:id",
        element: <ArtistProfile />
    }
]; 