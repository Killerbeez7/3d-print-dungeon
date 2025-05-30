import { SettingsPage } from "../components/settings/SettingsPage";
import { ArtistProfile } from "../components/artists/artist-profile/ArtistProfile";
import { ArtistsList } from "../components/artists/ArtistsList";
import { withMaintenance, withProtectedMaintenance } from "../helpers/routeHelpers";
import { ROUTES } from "../constants/routeConstants";

export const userRoutes = [
    { path: ROUTES.SETTINGS, element: withProtectedMaintenance(<SettingsPage />, { allowedRoles: ["admin", "artist", "user"] }) },
    { path: ROUTES.USER_ARTISTS, element: withMaintenance(<ArtistsList />) },
    { path: ROUTES.USER_ARTIST_PROFILE, element: withMaintenance(<ArtistProfile />) },
];
