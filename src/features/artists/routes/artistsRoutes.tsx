import { ROUTES } from "@/constants/routeConstants";
import { withMaintenance } from "@/helpers/routeHelpers";
import { ArtistsListPage } from "@/features/artists/pages/ArtistsListPage";
import { ArtistProfilePage } from "@/features/artists/pages/ArtistProfilePage";
import type { RouteObject } from "react-router-dom";

export const artistsRoutes: RouteObject[] = [
    { path: ROUTES.ARTISTS_LIST, element: withMaintenance(<ArtistsListPage />) },
    { path: ROUTES.ARTIST_PROFILE, element: withMaintenance(<ArtistProfilePage />) },
];
