import { SettingsPage } from "../pages/SettingsPage";
import { ArtistProfilePage } from "@/features/artists/pages/ArtistProfilePage";
import { ArtistsListPage } from "@/features/artists/pages/ArtistsListPage";
import { withMaintenance, withProtectedMaintenance } from "@/helpers/routeHelpers";
import { ROUTES } from "@/constants/routeConstants";
import type { RouteObject } from "react-router-dom";

export const settingsRoutes: RouteObject[] = [
    { path: ROUTES.SETTINGS, element: withProtectedMaintenance(<SettingsPage />, { allowedRoles: ["admin", "artist", "user"] }) },
    { path: ROUTES.ARTISTS_LIST, element: withMaintenance(<ArtistsListPage />) },
    { path: ROUTES.ARTIST_PROFILE, element: withMaintenance(<ArtistProfilePage />) },
];