import { ProfileSettings } from "../components/settings/ProfileSettings";
import { ArtistProfile } from "../components/artists/artist-profile/ArtistProfile";
import { ArtistsList } from "../components/artists/ArtistsList";
import { ProtectedRoute } from "../components/shared/ProtectedRoute";
import { MaintenanceRoute } from "../routes/MaintenanceRoute";

export const userRoutes = [
    {
        path: "/settings",
        element: (
            <MaintenanceRoute>
                <ProtectedRoute>
                    <ProfileSettings />
                </ProtectedRoute>
            </MaintenanceRoute>
        ),
    },
    {
        path: "/artists",
        element: (
            <MaintenanceRoute>
                <ArtistsList />
            </MaintenanceRoute>
        ),
    },
    {
        path: "/artist/:id",
        element: (
            <MaintenanceRoute>
                <ArtistProfile />
            </MaintenanceRoute>
        ),
    },
];
