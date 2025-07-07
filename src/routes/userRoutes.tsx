import { SettingsPage } from "../components/settings/SettingsPage";
import { ArtistProfile } from "../components/artists/artist-profile/ArtistProfile";
import { ArtistsList } from "../components/artists/ArtistsList";
import { withMaintenance, withProtectedMaintenance } from "../helpers/routeHelpers";
import { ROUTES } from "../constants/routeConstants";
import type { RouteObject } from "react-router-dom";

export const userRoutes: RouteObject[] = [
    { path: ROUTES.SETTINGS, element: withProtectedMaintenance(<SettingsPage />, { allowedRoles: ["admin", "artist", "user"] }) },
    { path: ROUTES.ARTISTS, element: withMaintenance(<ArtistsList />) },
    { path: ROUTES.ARTIST_PROFILE, element: withMaintenance(<ArtistProfile />) },
];