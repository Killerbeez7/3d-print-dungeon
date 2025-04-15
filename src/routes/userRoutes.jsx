import { ProfileSettings } from "../components/settings/ProfileSettings";
import { ArtistProfile } from "../components/artists/artist-profile/ArtistProfile";
import { ArtistsList } from "../components/artists/ArtistsList";
import { withMaintenance, withProtectedMaintenance } from "../helpers/routeHelpers";

export const userRoutes = [
    {
        path: "/settings",
        element: withProtectedMaintenance(<ProfileSettings />),
    },
    {
        path: "/artists",
        element: withMaintenance(<ArtistsList />),
    },
    {
        path: "/artist/:id",
        element: withMaintenance(<ArtistProfile />),
    },
];
